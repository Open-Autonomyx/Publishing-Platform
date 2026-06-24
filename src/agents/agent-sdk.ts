/**
 * Universal Creative Platform - Agent SDK
 * TypeScript SDK for building autonomous agents that integrate with the platform
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AgentConfig {
  apiBaseURL: string;
  apiKey: string;
  orgID: string;
  agentID: string;
  timeout?: number;
  retries?: number;
}

export interface AgentContext {
  orgID: string;
  agentID: string;
  runID: string;
  contentID?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  status: string;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  workflowType: string;
  config: Record<string, any>;
  status: string;
}

export interface ApprovalStage {
  id: string;
  name: string;
  sequenceOrder: number;
  approverRole: string;
  requiredCount: number;
}

export interface Approval {
  id: string;
  contentID: string;
  stageID: string;
  decision: 'approved' | 'rejected' | 'requested-changes';
  comment: string;
}

export interface Agent {
  id: string;
  name: string;
  agentType: string;
  config: Record<string, any>;
  status: string;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Agent SDK Class
// ============================================================================

export class CreativePlatformAgentSDK {
  private config: AgentConfig;
  private httpClient: AxiosInstance;
  private context: AgentContext;

  constructor(config: AgentConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config,
    };

    this.httpClient = axios.create({
      baseURL: this.config.apiBaseURL,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Agent-ID': this.config.agentID,
      },
    });

    this.context = {
      orgID: this.config.orgID,
      agentID: this.config.agentID,
      runID: this.generateRunID(),
    };

    this.setupInterceptors();
  }

  // ========================================================================
  // Content Management
  // ========================================================================

  /**
   * Create new content in the platform
   */
  async createContent(data: {
    title: string;
    description: string;
    contentType: string;
    workflowID?: string;
    metadata?: Record<string, any>;
  }): Promise<Content> {
    try {
      const response = await this.apiCall('POST', '/api/v1/content', {
        ...data,
        metadata: {
          ...data.metadata,
          agentID: this.config.agentID,
          runID: this.context.runID,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError('Failed to create content', error);
    }
  }

  /**
   * Get content by ID
   */
  async getContent(contentID: string): Promise<Content> {
    try {
      const response = await this.apiCall('GET', `/api/v1/content/${contentID}`);
      return response.data;
    } catch (error) {
      throw this.handleError(`Failed to get content ${contentID}`, error);
    }
  }

  /**
   * List content with filters
   */
  async listContent(params?: {
    status?: string;
    contentType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Content[]; total: number }> {
    try {
      const response = await this.apiCall('GET', '/api/v1/content', undefined, params);
      return response.data;
    } catch (error) {
      throw this.handleError('Failed to list content', error);
    }
  }

  /**
   * Update content
   */
  async updateContent(
    contentID: string,
    updates: Partial<Content>,
  ): Promise<Content> {
    try {
      const response = await this.apiCall('PUT', `/api/v1/content/${contentID}`, updates);
      return response.data;
    } catch (error) {
      throw this.handleError(`Failed to update content ${contentID}`, error);
    }
  }

  /**
   * Delete content
   */
  async deleteContent(contentID: string): Promise<void> {
    try {
      await this.apiCall('DELETE', `/api/v1/content/${contentID}`);
    } catch (error) {
      throw this.handleError(`Failed to delete content ${contentID}`, error);
    }
  }

  // ========================================================================
  // Workflow Management
  // ========================================================================

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowID: string): Promise<Workflow> {
    try {
      const response = await this.apiCall('GET', `/api/v1/workflows/${workflowID}`);
      return response.data;
    } catch (error) {
      throw this.handleError(`Failed to get workflow ${workflowID}`, error);
    }
  }

  /**
   * List all workflows
   */
  async listWorkflows(params?: {
    status?: string;
    workflowType?: string;
    limit?: number;
  }): Promise<{ data: Workflow[]; total: number }> {
    try {
      const response = await this.apiCall('GET', '/api/v1/workflows', undefined, params);
      return response.data;
    } catch (error) {
      throw this.handleError('Failed to list workflows', error);
    }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(data: {
    name: string;
    workflowType: string;
    config: Record<string, any>;
    description?: string;
  }): Promise<Workflow> {
    try {
      const response = await this.apiCall('POST', '/api/v1/workflows', data);
      return response.data;
    } catch (error) {
      throw this.handleError('Failed to create workflow', error);
    }
  }

  // ========================================================================
  // Approval Management
  // ========================================================================

  /**
   * Submit approval for content
   */
  async submitApproval(data: {
    contentID: string;
    stageID: string;
    decision: 'approved' | 'rejected' | 'requested-changes';
    comment?: string;
  }): Promise<Approval> {
    try {
      const response = await this.apiCall('POST', '/api/v1/approvals', data);
      return response.data;
    } catch (error) {
      throw this.handleError('Failed to submit approval', error);
    }
  }

  /**
   * Get approvals for content
   */
  async getApprovals(contentID: string): Promise<Approval[]> {
    try {
      const response = await this.apiCall('GET', `/api/v1/content/${contentID}/approvals`);
      return response.data;
    } catch (error) {
      throw this.handleError(`Failed to get approvals for content ${contentID}`, error);
    }
  }

  // ========================================================================
  // Agent Management
  // ========================================================================

  /**
   * Get agent configuration
   */
  async getAgent(agentID: string): Promise<Agent> {
    try {
      const response = await this.apiCall('GET', `/api/v1/agents/${agentID}`);
      return response.data;
    } catch (error) {
      throw this.handleError(`Failed to get agent ${agentID}`, error);
    }
  }

  /**
   * List agents
   */
  async listAgents(params?: {
    agentType?: string;
    status?: string;
  }): Promise<{ data: Agent[]; total: number }> {
    try {
      const response = await this.apiCall('GET', '/api/v1/agents', undefined, params);
      return response.data;
    } catch (error) {
      throw this.handleError('Failed to list agents', error);
    }
  }

  /**
   * Trigger another agent
   */
  async triggerAgent(agentID: string, input: Record<string, any>): Promise<AgentResult> {
    try {
      const response = await this.apiCall('POST', `/api/v1/agents/${agentID}/run`, {
        input,
        triggeredBy: this.config.agentID,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(`Failed to trigger agent ${agentID}`, error);
    }
  }

  // ========================================================================
  // Distribution Management
  // ========================================================================

  /**
   * Publish content to a channel
   */
  async publishContent(data: {
    contentID: string;
    channel: string;
    metadata?: Record<string, any>;
  }): Promise<{ id: string; status: string; publishedURL?: string }> {
    try {
      const response = await this.apiCall('POST', '/api/v1/distributions', data);
      return response.data;
    } catch (error) {
      throw this.handleError('Failed to publish content', error);
    }
  }

  /**
   * Get distributions for content
   */
  async getDistributions(contentID: string): Promise<Array<any>> {
    try {
      const response = await this.apiCall('GET', `/api/v1/content/${contentID}/distributions`);
      return response.data;
    } catch (error) {
      throw this.handleError(`Failed to get distributions for content ${contentID}`, error);
    }
  }

  // ========================================================================
  // Logging & Telemetry
  // ========================================================================

  /**
   * Log an action for audit trail
   */
  async logAction(action: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.apiCall('POST', '/api/v1/audit-logs', {
        action,
        resourceType: 'agent',
        resourceID: this.config.agentID,
        metadata,
      });
    } catch (error) {
      // Don't throw on logging errors
      console.error('Failed to log action:', error);
    }
  }

  /**
   * Report agent error
   */
  async reportError(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      await this.logAction('agent_error', {
        message: error.message,
        stack: error.stack,
        ...context,
      });
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private async apiCall(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any,
    params?: Record<string, any>,
  ): Promise<any> {
    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= this.config.retries!; attempt++) {
      try {
        const response = await this.httpClient.request({
          method,
          url: path,
          data,
          params,
        });
        return response.data;
      } catch (error) {
        lastError = error as AxiosError;

        // Retry only on network errors, not auth/validation errors
        if (
          attempt < this.config.retries! &&
          this.isRetryable(lastError)
        ) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
          continue;
        }

        throw lastError;
      }
    }

    throw lastError;
  }

  private isRetryable(error: AxiosError): boolean {
    if (!error.response) {
      return true; // Network error
    }

    const status = error.response.status;
    return status === 408 || status === 429 || status >= 500; // Timeout, rate limit, server error
  }

  private handleError(message: string, error: any): Error {
    if (error instanceof AxiosError) {
      const details = error.response?.data?.error || error.message;
      return new Error(`${message}: ${details}`);
    }
    return new Error(`${message}: ${error.message || error}`);
  }

  private generateRunID(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ========================================================================
  // Context Management
  // ========================================================================

  /**
   * Set context for current agent run
   */
  setContext(context: Partial<AgentContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get current context
   */
  getContext(): AgentContext {
    return this.context;
  }

  /**
   * Get current run ID
   */
  getRunID(): string {
    return this.context.runID;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create SDK instance from environment variables
 */
export function initializeSDK(): CreativePlatformAgentSDK {
  const config: AgentConfig = {
    apiBaseURL: process.env.API_BASE_URL || 'http://localhost:3001',
    apiKey: process.env.AGENT_API_KEY || '',
    orgID: process.env.ORG_ID || '',
    agentID: process.env.AGENT_ID || '',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    retries: parseInt(process.env.API_RETRIES || '3'),
  };

  if (!config.apiKey || !config.orgID || !config.agentID) {
    throw new Error(
      'Missing required environment variables: AGENT_API_KEY, ORG_ID, AGENT_ID',
    );
  }

  return new CreativePlatformAgentSDK(config);
}

// ============================================================================
// Export
// ============================================================================

export default CreativePlatformAgentSDK;
