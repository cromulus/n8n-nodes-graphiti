import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import { searchEpisodes, addEpisode, getMemory } from './GenericFunctions';
import { z } from 'zod';

// Zod schema defining exactly what parameters AI agents can populate
export const inputSchema = z.object({
	operation: z.enum(['searchKnowledge', 'addKnowledge', 'getMemory'])
		.describe('Knowledge operation to perform: searchKnowledge (semantic search), addKnowledge (add new episode), or getMemory (get contextual memory)'),

	// For searchKnowledge operation
	query: z.string().optional()
		.describe('Natural language query to search for in the knowledge graph (auto-detected from query, search, question fields)'),

	searchType: z.enum(['edge', 'node']).default('edge').optional()
		.describe('Search type: "edge" finds relationships/connections, "node" finds core concepts/entities'),

	centerNodeUuid: z.string().optional()
		.describe('UUID of a specific node to focus edge searches around for more contextual results'),

	limit: z.number().min(1).max(100).default(50).optional()
		.describe('Maximum number of search results to return (1-100, default: 50, only for node searches)'),

		// For addKnowledge operation
	name: z.string().optional()
		.describe('Human-readable name for the knowledge episode (auto-detected from name, title, subject fields)'),

	content: z.string().optional()
		.describe('The actual knowledge content - can be text or JSON (auto-detected from content, text, data, body fields)'),

	contentType: z.enum(['text', 'json']).default('text').optional()
		.describe('Type of content: "text" for unstructured text, "json" for structured data (auto-detected from content format)'),

	description: z.string().optional()
		.describe('Brief summary of what this knowledge episode contains (auto-detected from description, summary fields)'),

	referenceTime: z.string().optional()
		.describe('Optional ISO 8601 timestamp for when this knowledge occurred (auto-detected from timestamp, date, time fields or current time)'),

	// For getMemory operation
	groupId: z.string().optional()
		.describe('Group ID to retrieve memory from (auto-detected from groupId, sessionId, conversationId fields)'),

	maxFacts: z.number().min(1).max(50).default(10).optional()
		.describe('Maximum number of memory facts to retrieve (1-50, default: 10)'),

	messages: z.array(z.object({
		content: z.string().describe('Message content'),
		role_type: z.enum(['user', 'assistant', 'system']).describe('Role type'),
		role: z.string().optional().describe('Custom role name'),
		timestamp: z.string().optional().describe('Message timestamp'),
	})).optional()
		.describe('Messages to build the memory retrieval query from (required for getMemory)'),
});

export class GraphitiKnowledgeTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Graphiti Knowledge Tool',
		name: 'graphitiKnowledgeTool',
		icon: 'fa:search',
		group: ['AI'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'AI Tool for searching and managing knowledge using Graphiti knowledge graph. AI agents can perform semantic searches, add new knowledge episodes, and retrieve contextual memory with schema-controlled parameters.',
		defaults: {
			name: 'Graphiti Knowledge Tool',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		toolDescription: 'AI Tool for searching and managing knowledge using Graphiti knowledge graph. AI agents can perform semantic searches, add new knowledge episodes, and retrieve contextual memory with schema-controlled parameters.',
		credentials: [
			{
				name: 'graphitiApi',
				required: true,
			},
		],
		// AI Tool schema export (for future AI Tool integration)
		// inputSchema,
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search Knowledge',
						value: 'searchKnowledge',
						description: 'Perform semantic search over the knowledge graph',
						action: 'Search knowledge graph',
					},
					{
						name: 'Add Knowledge',
						value: 'addKnowledge',
						description: 'Add new knowledge episode to the graph',
						action: 'Add knowledge to graph',
					},
					{
						name: 'Get Memory',
						value: 'getMemory',
						description: 'Retrieve contextual memory based on messages',
						action: 'Get contextual memory',
					},
				],
				default: 'searchKnowledge',
			},
			// Search Knowledge Fields
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '={{$json.query || $json.search || $json.question || $json.prompt || $json.message}}',
				description: 'Natural language query to search for in the knowledge graph (auto-detected from common query fields)',
				required: true,
				displayOptions: {
					show: {
						operation: ['searchKnowledge'],
					},
				},
			},
			{
				displayName: 'Search Type',
				name: 'searchType',
				type: 'options',
				options: [
					{ name: 'Edge (Relationships)', value: 'edge' },
					{ name: 'Node (Concepts)', value: 'node' },
				],
				default: 'edge',
				description: 'Edge finds relationships between concepts, Node finds core concepts/entities',
				displayOptions: {
					show: {
						operation: ['searchKnowledge'],
					},
				},
			},
			{
				displayName: 'Center Node UUID',
				name: 'centerNodeUuid',
				type: 'string',
				default: '',
				description: 'UUID of a specific node to focus edge searches around for more contextual results',
				displayOptions: {
					show: {
						operation: ['searchKnowledge'],
						searchType: ['edge'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
				},
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						operation: ['searchKnowledge'],
						searchType: ['node'],
					},
				},
			},
			// Add Knowledge Fields
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '={{$json.name || $json.title || $json.subject || $json.episodeName}}',
				description: 'Human-readable name for the knowledge episode (auto-detected from name/title/subject fields)',
				required: true,
				displayOptions: {
					show: {
						operation: ['addKnowledge'],
					},
				},
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '={{$json.content || $json.text || $json.data || $json.body || $json.information}}',
				description: 'The actual knowledge content (auto-detected from content/text/data/body fields)',
				required: true,
				displayOptions: {
					show: {
						operation: ['addKnowledge'],
					},
				},
			},
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'options',
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'JSON', value: 'json' },
				],
				default: 'text',
				description: 'Type of content being added',
				displayOptions: {
					show: {
						operation: ['addKnowledge'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '={{$json.description || $json.summary || $json.about || $json.details}}',
				description: 'Brief summary of what this knowledge episode contains (auto-detected from description/summary fields)',
				required: true,
				displayOptions: {
					show: {
						operation: ['addKnowledge'],
					},
				},
			},
			{
				displayName: 'Reference Time',
				name: 'referenceTime',
				type: 'dateTime',
				default: '={{$json.referenceTime || $json.timestamp || $json.date || $json.time || new Date().toISOString()}}',
				description: 'Timestamp for when this knowledge occurred (auto-detected from time fields or current time)',
				displayOptions: {
					show: {
						operation: ['addKnowledge'],
					},
				},
			},
			// Get Memory Fields
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '={{$json.groupId || $json.sessionId || $json.conversationId || $workflow.id + "_" + $execution.id}}',
				description: 'Group ID to retrieve memory from (auto-detected from groupId/sessionId fields or generated)',
				required: true,
				displayOptions: {
					show: {
						operation: ['getMemory'],
					},
				},
			},
			{
				displayName: 'Max Facts',
				name: 'maxFacts',
				type: 'number',
				default: 10,
				typeOptions: {
					minValue: 1,
					maxValue: 50,
				},
				description: 'Maximum number of memory facts to retrieve',
				displayOptions: {
					show: {
						operation: ['getMemory'],
					},
				},
			},
			{
				displayName: 'Center Node UUID',
				name: 'centerNodeUuid',
				type: 'string',
				default: '',
				description: 'Optional UUID of a node to center memory retrieval around',
				displayOptions: {
					show: {
						operation: ['getMemory'],
					},
				},
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				default: {},
				description: 'Messages to build the memory retrieval query from',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['getMemory'],
					},
				},
				options: [
					{
						name: 'message',
						displayName: 'Message',
						values: [
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								default: '',
								description: 'The content of the message',
								required: true,
							},
							{
								displayName: 'Role Type',
								name: 'role_type',
								type: 'options',
								options: [
									{ name: 'User', value: 'user' },
									{ name: 'Assistant', value: 'assistant' },
									{ name: 'System', value: 'system' },
								],
								default: 'user',
								description: 'The role type of the message',
								required: true,
							},
							{
								displayName: 'Role',
								name: 'role',
								type: 'string',
								default: '',
								description: 'Custom role name',
							},
							{
								displayName: 'Timestamp',
								name: 'timestamp',
								type: 'dateTime',
								default: '',
								description: 'Optional timestamp for the message',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'searchKnowledge') {
					const query = this.getNodeParameter('query', i) as string;
					const searchType = this.getNodeParameter('searchType', i, 'edge') as string;
					const centerNodeUuid = this.getNodeParameter('centerNodeUuid', i, '') as string;
					const limit = this.getNodeParameter('limit', i, 50) as number;

					const params = {
						query,
						searchType,
						centerNodeUuid: centerNodeUuid || '',
						limit,
					};

					const searchResponse = await searchEpisodes(this, params);
					returnData.push({
						json: {
							results: searchResponse.results || [],
							query,
							searchType,
							operation: 'searchKnowledge',
							resultsCount: (searchResponse.results || []).length,
							...searchResponse,
						},
					});

				} else if (operation === 'addKnowledge') {
					const name = this.getNodeParameter('name', i) as string;
					const content = this.getNodeParameter('content', i) as string;
					const contentType = this.getNodeParameter('contentType', i, 'text') as string;
					const description = this.getNodeParameter('description', i) as string;
					const referenceTime = this.getNodeParameter('referenceTime', i, '') as string;

					const params = {
						name,
						content,
						type: contentType,
						description,
						referenceTime,
					};

					const addResponse = await addEpisode(this, params);
					returnData.push({
						json: {
							success: true,
							name,
							description,
							contentType,
							operation: 'addKnowledge',
							...addResponse,
						},
					});

				} else if (operation === 'getMemory') {
					const groupId = this.getNodeParameter('groupId', i) as string;
					const maxFacts = this.getNodeParameter('maxFacts', i, 10) as number;
					const centerNodeUuid = this.getNodeParameter('centerNodeUuid', i, '') as string;
					const messagesData = this.getNodeParameter('messages', i, {}) as any;

					const messages = messagesData.message || [];

					const params = {
						group_id: groupId,
						max_facts: maxFacts,
						center_node_uuid: centerNodeUuid || undefined,
						messages,
					};

					const memoryResponse = await getMemory(this, params);
					returnData.push({
						json: {
							memory: memoryResponse.memory || [],
							facts: memoryResponse.facts || [],
							groupId,
							operation: 'getMemory',
							factsCount: (memoryResponse.facts || []).length,
							...memoryResponse,
						},
					});
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							operation,
							success: false,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
