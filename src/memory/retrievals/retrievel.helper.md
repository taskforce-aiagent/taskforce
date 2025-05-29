# `memoryProvider.loadRelevantMemory(query)` vs `retriever.retrieve(query)`

### Agent Framework’te Bilgi Zenginleştirme Yöntemleri

---

## 1. `memoryProvider.loadRelevantMemory(query)`

**Klasik, internal (vektör tabanlı veya basit) hafıza erişimi.**

- **Ne yapar?**

  - Sadece sistemin kendi ürettiği geçmiş output/summary bilgisini semantic olarak arar.
  - Kendi local vektör veritabanından, kısa/uzun hafıza veya chat memory’den yakın sonuçları döndürür.

- **Kullanım amacı:**

  - Bir agent’ın kendi geçmiş görevlerinden veya pipeline çıktılarından öğrenmesini, yani “internal knowledge enrichment” sağlar.
  - Self-improving, context injection veya “bu soruya geçmişte nasıl cevap verdim?” senaryoları.
  - Sistem içinde case memory, örnek cevap, özet veya geçmiş diyalogları tekrar kullanmak için.

- **Tipik Senaryolar:**
  - Agent’ın/LLM’in önceki çıktılarından örnek çekmesi.
  - Pipeline boyunca oluşan intermediate knowledge/summary’lerden faydalanmak.
  - Kullanıcı ile geçmiş chat veya task bazlı memory üzerinden enrichment.
  - Sadece kendi local memory’si olan agent’larda.

---

## 2. `retriever.retrieve(query)`

**Harici (veya daha modüler) bilgi erişimi.**

- **Ne yapar?**

  - Bir harici bilgi kaynağından (external vector DB, API, belge, RAG, Chroma, Pinecone vb.) semantic olarak veri çeker.
  - Hem local vector provider hem de OpenAI, LangChain Retriever gibi büyük framework’ler ile kullanılabilir.
  - Multi-source, domain-agnostik veya doküman tabanlı bilgi arayabilir.

- **Kullanım amacı:**

  - Sisteme harici knowledge base, PDF, destek dokümanları veya başka veri kaynaklarından bilgi eklemek.
  - RAG tabanlı uygulamalarda, LangChain veya OpenAI retriever entegrasyonlarında.
  - “Kendi hafızam dışında dış dünyadan bilgiye ihtiyacım var” durumları.

- **Tipik Senaryolar:**
  - Knowledge base, doküman, PDF, external dataset tabanlı retrieval.
  - Support chatbot, FAQ, domain knowledge gibi ek bilgi gerektiren task’lar.
  - Chroma, Pinecone, Supabase, OpenAI API üzerinden retrieval.
  - Çoklu/harici kaynaklarla (hybrid veya hierarchical) semantic search yapmak.

---

## KULLANIMIN EN BÜYÜK FARKI

| Kullanım                    | Fonksiyon                           | Özet                                                 |
| --------------------------- | ----------------------------------- | ---------------------------------------------------- |
| Internal agent memory       | `memoryProvider.loadRelevantMemory` | _Sadece agent’ın kendi geçmişi_                      |
| Harici/doküman/çoklu kaynak | `retriever.retrieve`                | _External, domain-agnostik veya çoklu bilgi kaynağı_ |

- **`memoryProvider.loadRelevantMemory`:**  
  Agent’ın internal/local hafızası (vektör tabanlı, JSON, vs.)

  > _“Sistemin kendi geçmişinden bana yakın bilgi lazım.”_

- **`retriever.retrieve`:**  
  Harici, domain-agnostik veya çoklu kaynak (Chroma, Pinecone, LangChain Retriever, external docs Knowlege Base (KB))
  > _“Dış/ek bilgi kaynağına veya çoklu kaynağa semantic query at.”_

---

## **Ne Zaman Hangisini Kullanırsın?**

1. **Sadece agent’ın kendi geçmişine bakılacaksa:**  
   `memoryProvider.loadRelevantMemory(query)`

   - Sadece pipeline’da oluşan veya geçmişte agent’ın verdiği cevaplar önemliyse.

2. **Dış/ekstra bilgi kaynağı (RAG, external KB, doküman, PDF) lazımsa:**  
   `retriever.retrieve(query)`

   - Sadece external knowledge base, vektör database veya dokümanlardan enrichment istiyorsan.

3. **İkisini birleştirmek gerekirse:**
   - Önce internal memory’den al, ardından external KB’den çek.
   - Sonuçları birleştir veya uygun bir öncelik sırası belirle.

---

## **Örnek Kod Akışı**

```typescript
let internalContext = await memoryProvider.loadRelevantMemory(query); // Agent'ın kendi geçmişi
let externalContext = await retriever.retrieve(query); // Harici/doküman kaynaklı bilgi

let combined = internalContext + "\n" + externalContext;
```

---

## Retriever Nerede Tanımlanır ve Öncelik Sırası

### Agent’a mı, TaskForce’a mı retriever eklenir?

---

### **Agent Düzeyinde retriever (`agent.retriever`):**

- Eğer o agent’ın SÜREKLİ olarak belirli bir bilgi kaynağına ihtiyacı varsa **doğrudan agent'a eklenir.**
- Örneğin, bir `LegalBot` agent'ı varsa ve her zaman _legal-docs KB_’ye bakacaksa doğrudan agent’ın `retriever` alanına yazılır.

---

### **TaskForce Düzeyinde retriever (`taskForce.retriever`):**

- Pipeline seviyesinde bir KB veya dış veri kaynağı merkezi olarak kullanılacaksa,
- veya **birçok agent aynı retriever'ı paylaşacaksa TaskForce seviyesinde tanımlanır.**
- Genellikle domain-agnostik, ortak kullanılacak knowledge base veya hybrid RAG için önerilir.

---

### **Override Sırası (Hangisi Kullanılır?)**

- **Eğer agent’a retriever atanmışsa _o_ kullanılır.**
- Agent’ta retriever yoksa, **TaskForce’un retriever’ı** kullanılır.
- **Agent retriever, TaskForce retriever’ı override eder** (önceliklidir).

---

## 3. `conversationalRetrievalChain`

### (Reasoning Chain, Multi-turn RAG, Chat-Augmented Q&A)

### **Nedir ve Ne Yapar?**

- **Amaç:**  
  Sadece geçmiş hafızadan veya external KB’den veri “enjekte etmek” yerine,  
  _hem_ harici bilgi tabanını _hem_ diyalog geçmişini (chat history) **prompt’a dahil edip**,  
  **LLM’in bu bağlamda kendi cevabını üretmesini** sağlar.

- **Yani:**  
  Sadece enrichment ile kalan bir “bilgi zenginleştirme” yerine,  
  **“prompt engineering + retrieval + reasoning”** zinciri kurar.

---

### **Kullanım Senaryosu:**

- **Chatbot veya multi-turn Q&A** sistemlerinde:

  - Kullanıcıyla yapılan önceki konuşmaları ve harici bilgi tabanını birlikte kullanarak,  
    bağlama duyarlı (contextual) ve daha doğru/derin cevaplar üretir.
  - Örneğin:  
    “Önceki sohbette bana fatura sürecini anlatmıştın, tekrar hatırlatır mısın?”  
    Agent, önceki chat history’den ve knowledge base’ten birlikte faydalanır.

- **LLM-augmented agent workflow:**
  - Bir görevde hem döküman KB hem de geçmiş konuşmalar (veya önceki task output’ları)  
    prompt’a eklenir, LLM reasoning zinciriyle en uygun cevabı üretir.

---

### **Ne Zaman Kullanılır?**

- Klasik enrichment (“prompt’a bilgi ekle ve bırak”) YETERLİ OLMADIĞINDA,
- Kullanıcının daha önceki soruları/cevapları bağlamda önemliyse,
- KB’den dönen veri direkt copy-paste değil, “reasoning/yorumlama” gerektiriyorsa,
- Multi-turn, context-dependent Q&A, doc-augmented chat, RAG chatbot gibi ileri senaryolarda.

---

### **Kod Kullanımı (Örnek):**

```typescript
import { conversationalRetrievalChain } from "./memory/retrieval.helper";

// Örnek veri:
const query = "Kira kontratı hangi şartlarda feshedilebilir?";
const chatHistory = [
  "Kullanıcı: Sözleşme süresi dolmadan çıkmak istersem ne yapmalıyım?",
  "Agent: Erken fesih için sözleşmedeki şartlara bakmak gerekir.",
];

// retriever: herhangi bir Retriever implementasyonu (Chroma, Pinecone, LocalVector, LangChain vb.)
const result = await conversationalRetrievalChain(
  query,
  retriever,
  "gpt-4o-mini", // model adı
  chatHistory,
  true // verbose
);
console.log(result);
```

---

## 4. `Vector Retriever`

### Vector Retrieverlar nasıl projeye eklenir

#### **Kod Kullanımı (Örnek): 1. Bir Agent’a Retriever Olarak Atamak**

```typescript
import { LocalVectorRetriever } from "./memory/retrievals/localVectorRetriever";
import { MyVectorMemoryProvider } from "./memory/vectorMemoryProviders/myVectorMemoryProvider";

const legalRetriever = new LocalVectorRetriever(
  new MyVectorMemoryProvider(/*...*/)
);

const legalAgent = new Agent({
  name: "LegalBot",
  role: "Legal Document Specialist",
  // diğer agent alanları...
  retriever: legalRetriever, // Buraya ekliyorsun
  memoryScope: MemoryScope.Long,
});
```

#### \***\*Kod Kullanımı (Örnek): 2. TaskForce Düzeyinde Retriever Kullanmak**

```typescript
import { LocalVectorRetriever } from "./memory/retrievals/localVectorRetriever";
import { MyVectorMemoryProvider } from "./memory/vectorMemoryProviders/myVectorMemoryProvider";

const sharedRetriever = new LocalVectorRetriever(
  new MyVectorMemoryProvider(/*...*/)
);

const taskForce = new TaskForce({
  agents: [
    /* ... */
  ],
  tasks: [
    /* ... */
  ],
  retriever: sharedRetriever, // TaskForce seviyesinde retriever
  // diğer configler...
});
```

---

### **3. Kullanım Örnekleri**

- #### Chat sırasında enrichment:

  - Agent, kendi görevini yürütürken LocalVectorRetriever ile ilgili KB’den anında bilgi çeker.

- #### Her agent için farklı retriever:

  - Her agent’a farklı LocalVectorRetriever atayabilirsin (ör. birisi insan kaynakları vektör KB’si, diğeri teknik doküman KB’si).

- #### Ortak retriever:

  B- ütün pipeline için ortak bir LocalVectorRetriever tanımlar, tüm agent’lar bundan yararlanır.

---

#### \***\*Kod Kullanımı (Örnek): 4. Pratik Kod Parçası**

```typescript
// LocalVectorRetriever kullanımı (örnek)
const vectorProvider =
  new MyVectorMemoryProvider(/* db yolunu veya configini ver */);
const retriever = new LocalVectorRetriever(vectorProvider);

// Agent'a ekleyerek
const agent = new Agent({
  name: "DocAgent",
  retriever, // buraya ekle
  // diğer alanlar...
});

// Veya TaskForce'da merkezi olarak
const taskForce = new TaskForce({
  agents: [agent],
  tasks: [
    /* ... */
  ],
  retriever, // buraya ekle
});
```

## Not

- #### Agent ve TaskForce’a aynı anda retriever verirsen:

  - Agent’ın kendi retriever’ı varsa, o kullanılır (öncelikli).

  - **MyVectorMemoryProvider** örnek bir class; mevcut projendeki vector memory provider’ı kullanmalısın.

### Sonuç

- Sadece bir LocalVectorRetriever instance’ı oluşturup ilgili yere ata. Kodun geri kalanı otomatik olarak doğru retriever’ı kullanır!
- Hiçbir yerde elle .retrieve() çağırmana gerek yok; agent ya da task yürürken kendi çağıracak.

---

# Alternatif Retriever Senaryosu

## **Kod Kullanımı: Cloud Storage ile Kullanım Senaryosu**

```typescript
// S3'ten memory sağlayan bir provider örneği:
class S3VectorMemoryProvider implements VectorMemoryProvider {
  async loadRelevantMemory(
    query: string,
    limit: number = 3
  ): Promise<VectorMemoryRecord[]> {
    // 1. S3'ten ilgili dosyayı indir
    // 2. Dosyadan vektörleri ve summary/outputları parse et
    // 3. Semantic search (query embedding vs record embedding)
    // 4. En iyi eşleşmeleri VectorMemoryRecord[] olarak döndür
    return []; // örnek
  }
}

const s3Provider = new S3VectorMemoryProvider();
const retriever = new LocalVectorRetriever(s3Provider);

// Agent'a ekleyerek
const agent = new Agent({
  name: "DocAgent",
  retriever, // buraya ekle
  // diğer alanlar...
});

// Agent içinde (runTask veya benzeri), otomatik olarak:
const enrichedContext = await retrieveAndEnrichPrompt(
  query, // genelde input veya user mesajı
  this.retriever, // agent.retriever varsa onu kullan
  this.memoryProvider, // yoksa memoryProvider
  this.model, // LLM modeli (gpt-4o-mini vs.)
  this.verbose, // loglamak istiyorsan true
  {
    agent: this.name, // ⬅️ agent bazlı filtreleme
    taskId: taskDescription, // ⬅️ görev bazlı filtreleme
  }
);
// Agent içinde İstersen retriever’ı doğrudan da çağırabilirsin:
const results = await retriever.retrieve("kontrat feshi şartları", {
  limit: 5,
  raw: true,
});
console.log(results); // VectorMemoryRecord[]
```
