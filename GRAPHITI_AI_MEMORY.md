# Graphiti AI Memory for n8n

Transform your AI workflows with **persistent, contextual memory** using Graphiti's knowledge graph.

## 🧠 What is Graphiti AI Memory?

The **Graphiti AI Memory** node provides intelligent memory management for AI conversations in n8n. Instead of stateless interactions, your AI assistants gain:

- **Persistent memory** across conversations and time
- **Contextual understanding** of past interactions  
- **Semantic retrieval** of relevant conversation history
- **Entity tracking** for people, places, and concepts
- **Session management** for organized conversations

## 🔄 Typical AI Memory Workflow

```
1. User Input → 2. Retrieve Memory → 3. AI Processing → 4. Store Conversation → 5. Repeat
   (n8n trigger)   (Graphiti Memory)    (OpenAI/Claude)   (Graphiti Memory)
```

### Step-by-Step Flow:

1. **User sends a message** (via webhook, chat, form, etc.)
2. **Retrieve Memory** - Get relevant context from previous conversations
3. **AI Processing** - Send context + user message to AI (OpenAI, Claude, etc.)
4. **Store Conversation** - Save user message + AI response to memory
5. **Return AI response** to user

## 🛠️ Operations

### 1. **Initialize Session**
Create a new conversation session
- **Use**: Start of new conversations
- **Returns**: Session ID for tracking

### 2. **Retrieve Memory** ⭐ *Most Important*
Get relevant context before AI processing
- **Input**: Current user message
- **Returns**: Relevant conversation history and context
- **Use**: Before every AI call

### 3. **Store Conversation** ⭐ *Most Important*  
Save user input and AI response to memory
- **Input**: User message + AI response
- **Use**: After every AI response

### 4. **Get Session History**
Retrieve complete conversation history
- **Use**: Debugging, conversation export, context building

### 5. **Store Entity**
Extract important entities from conversations
- **Use**: Track people, places, concepts mentioned

## 🎯 Example Workflow

### Basic AI Memory Workflow:

```json
{
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "name": "Retrieve Context",
      "type": "n8n-nodes-graphiti.graphitiMemory",
      "parameters": {
        "operation": "retrieveMemory",
        "sessionId": "user_{{$json.userId}}",
        "currentMessage": "{{$json.message}}",
        "maxFacts": 8
      }
    },
    {
      "name": "AI Response",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant. Use this context from previous conversations: {{$json.context}}"
          },
          {
            "role": "user", 
            "content": "{{$('Webhook Trigger').item.json.message}}"
          }
        ]
      }
    },
    {
      "name": "Store Memory",
      "type": "n8n-nodes-graphiti.graphitiMemory",
      "parameters": {
        "operation": "storeConversation",
        "sessionId": "user_{{$('Webhook Trigger').item.json.userId}}",
        "userMessage": "{{$('Webhook Trigger').item.json.message}}",
        "aiResponse": "{{$json.choices[0].message.content}}"
      }
    }
  ]
}
```

## 🔧 Smart Defaults

The memory node includes intelligent defaults:

- **Session ID**: Auto-generates based on workflow + execution ID
- **Current Message**: Automatically picks up from `$json.message`, `$json.userInput`, or `$json.input`
- **User Message**: Flexible input mapping for common field names
- **AI Response**: Maps to common AI response fields

## 💡 Pro Tips

### 1. **Session Management**
Use consistent session IDs to maintain conversation continuity:
```javascript
// By user ID
"sessionId": "user_{{$json.userId}}"

// By conversation topic
"sessionId": "support_{{$json.ticketId}}"

// By workflow
"sessionId": "{{$workflow.name}}_{{$json.sessionId}}"
```

### 2. **Context Optimization**
- Start with `maxFacts: 8` for most conversations
- Increase to `15-20` for complex, multi-topic discussions
- Use `centerNodeUuid` to focus on specific entities/topics

### 3. **Entity Tracking**
Store important entities mentioned in conversations:
- People: Names, roles, relationships
- Places: Locations, addresses, venues  
- Concepts: Products, services, topics

### 4. **Memory Patterns**

**Simple Memory**: Just retrieve + store
```
User Input → Retrieve Memory → AI → Store Conversation
```

**Smart Memory**: With entity tracking
```
User Input → Retrieve Memory → AI → Store Conversation → Extract Entities → Store Entity
```

**Session Memory**: With initialization
```
New User → Initialize Session → [Simple Memory Pattern] → Continue...
```

## 🚀 Benefits

### For Users:
- **Continuity**: AI remembers previous conversations
- **Personalization**: Context-aware responses
- **Efficiency**: No need to repeat information

### For Developers:
- **Easy Integration**: Drop into existing AI workflows
- **Flexible**: Works with any AI provider
- **Scalable**: Handles multiple users/sessions
- **Searchable**: Query conversation history semantically

## 🔗 Compatible with All AI Nodes

- OpenAI (GPT-3.5, GPT-4, etc.)
- Claude (Anthropic)
- Google AI (Gemini)
- Local AI models
- Custom AI endpoints

## 🎓 Getting Started

1. **Add Graphiti credentials** with your instance URL
2. **Add "Graphiti AI Memory" node** to your workflow
3. **Start with "Retrieve Memory"** before AI processing
4. **Add "Store Conversation"** after AI responses
5. **Test with a simple conversation** to see memory in action

Your AI assistants will now have persistent, contextual memory! 🧠✨ 
