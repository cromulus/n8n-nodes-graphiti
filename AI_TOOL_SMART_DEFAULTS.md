# 🤖 AI Tool Smart Defaults & Auto-Population

The Graphiti AI Tool nodes include **intelligent auto-population** that pre-fills parameters for both **users** and **AI agents** by detecting common field patterns.

## 🧠 **Graphiti AI Memory Tool** - Auto-Population Features

### 🔧 **Session Management**
```javascript
// Auto-detects session ID from multiple sources
sessionId: $json.sessionId || $workflow.id + "_" + $execution.id

// Result: "workflow_123_execution_456" (auto-generated unique ID)
```

### 💬 **Memory Retrieval** 
```javascript
// Auto-detects current message from common fields
currentMessage: $json.message || $json.userInput || $json.input || $json.currentMessage

// Works with data like:
{ "message": "What did we discuss yesterday?" }
{ "userInput": "Tell me about project status" }
{ "input": "How can I help you?" }
```

### 💾 **Conversation Storage**
```javascript
// Auto-detects user message
userMessage: $json.userMessage || $json.userInput || $json.input || $json.message

// Auto-detects AI response
aiResponse: $json.aiResponse || $json.output || $json.response || $json.assistantResponse

// Auto-detects participant names
userName: $json.userName || $json.user || $json.name || "User"
aiName: $json.aiName || $json.assistantName || $json.botName || "Assistant"
```

### 🏷️ **Entity Storage**
```javascript
// Auto-detects entity information
entityName: $json.entityName || $json.name || $json.title
entityUuid: $json.entityUuid || $json.uuid || $workflow.id + "_entity_" + Date.now()
entitySummary: $json.entitySummary || $json.entityDescription || $json.summary || $json.description
```

---

## 🔍 **Graphiti Knowledge Tool** - Auto-Population Features

### 🔎 **Knowledge Search**
```javascript
// Auto-detects search queries
query: $json.query || $json.search || $json.question || $json.prompt || $json.message

// Works with data like:
{ "query": "machine learning best practices" }
{ "search": "customer feedback analysis" }
{ "question": "How does GraphQL work?" }
{ "prompt": "Explain database indexing" }
```

### 📚 **Knowledge Addition**
```javascript
// Auto-detects episode information
name: $json.name || $json.title || $json.subject || $json.episodeName
content: $json.content || $json.text || $json.data || $json.body || $json.information
description: $json.description || $json.summary || $json.about || $json.details

// Auto-detects or generates timestamps
referenceTime: $json.referenceTime || $json.timestamp || $json.date || $json.time || new Date().toISOString()
```

### 🧠 **Memory Retrieval**
```javascript
// Auto-detects group/session identifiers
groupId: $json.groupId || $json.sessionId || $json.conversationId || $workflow.id + "_" + $execution.id
```

---

## 🔄 **Smart Data Flow Examples**

### Example 1: **Chat Bot Workflow**
```json
// Input data from webhook
{
  "message": "What's our sales performance this quarter?",
  "userName": "Alice Johnson",
  "sessionId": "chat_session_123"
}

// Auto-populated in Memory Tool:
{
  "operation": "retrieveMemory",
  "sessionId": "chat_session_123",        // ← Auto-detected
  "currentMessage": "What's our sales...", // ← Auto-detected
  "maxFacts": 8
}
```

### Example 2: **Document Processing**
```json
// Input data from document processor
{
  "title": "Q4 Sales Report", 
  "content": "Sales increased by 15% compared to last quarter...",
  "summary": "Quarterly sales analysis and trends",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Auto-populated in Knowledge Tool:
{
  "operation": "addKnowledge",
  "name": "Q4 Sales Report",              // ← Auto-detected from title
  "content": "Sales increased by 15%...", // ← Auto-detected
  "description": "Quarterly sales...",    // ← Auto-detected from summary
  "referenceTime": "2024-01-15T10:30:00Z" // ← Auto-detected
}
```

### Example 3: **AI Agent Conversation**
```json
// Input from AI response
{
  "userInput": "How do I configure SSL certificates?",
  "assistantResponse": "To configure SSL certificates, follow these steps...",
  "user": "DevOps Team",
  "assistantName": "Technical Assistant"
}

// Auto-populated in Memory Tool:
{
  "operation": "storeConversation",
  "sessionId": "workflow_456_execution_789", // ← Auto-generated
  "userMessage": "How do I configure...",     // ← Auto-detected
  "aiResponse": "To configure SSL...",        // ← Auto-detected  
  "userName": "DevOps Team",                  // ← Auto-detected
  "aiName": "Technical Assistant"             // ← Auto-detected
}
```

---

## 🎯 **Benefits for Users & AI Agents**

### 👤 **For Human Users:**
- ✅ **No manual field mapping** - Works with any JSON structure
- ✅ **Intelligent defaults** - Reasonable fallbacks when fields missing
- ✅ **Time-saving** - Pre-fills 80%+ of parameters automatically
- ✅ **Flexible input** - Accepts various field naming conventions

### 🤖 **For AI Agents:**
- ✅ **Schema guidance** - Zod schemas tell agents exactly what they can control
- ✅ **Auto-discovery** - Finds the right data without explicit mapping
- ✅ **Type safety** - Validates all inputs automatically
- ✅ **Smart fallbacks** - Generates unique IDs and timestamps when needed

---

## 🛠️ **Manual Override Support**

All auto-populated fields can be **manually overridden** by providing explicit values:

```javascript
// Override auto-detection with specific values
{
  "sessionId": "custom_session_id",           // ← Manual override
  "userName": "Specific User Name",           // ← Manual override  
  "maxFacts": 15                             // ← Manual override
}
```

The auto-population serves as **intelligent defaults** while preserving full control when needed.

---

## 🚀 **Getting Started**

1. **For Users**: Just send data with common field names - the nodes will auto-detect and populate
2. **For AI Agents**: Use the exported Zod schemas to understand available parameters
3. **For Developers**: Leverage n8n expressions `={{$json.field}}` for custom auto-population

Your AI workflows now have **smart defaults** that work out of the box! 🎉 
