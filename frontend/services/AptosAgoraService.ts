import { AptosClient, Types } from 'aptos';

/**
 * Service class for interacting with AptosAgora smart contracts
 */
export class AptosAgoraService {
  private client: AptosClient;
  private moduleAddress: string;

  /**
   * Initialize the service
   * @param nodeUrl Aptos node URL
   * @param moduleAddress Address of the AptosAgora module
   */
  constructor(nodeUrl: string = 'https://fullnode.devnet.aptoslabs.com/v1', moduleAddress: string = '0x1') {
    this.client = new AptosClient(nodeUrl);
    this.moduleAddress = moduleAddress;
  }

  /**
   * Get content details by ID
   * @param contentId Content ID
   * @returns Content details
   */
  async getContent(contentId: string): Promise<Types.MoveValue> {
    try {
      return await this.client.view({
        function: `${this.moduleAddress}::content_registry::get_content`,
        type_arguments: [],
        arguments: [contentId]
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  /**
   * Get creator profile
   * @param address Creator address
   * @returns Creator profile details
   */
  async getCreatorProfile(address: string): Promise<Types.MoveValue> {
    try {
      return await this.client.view({
        function: `${this.moduleAddress}::creator_profiles::get_profile`,
        type_arguments: [],
        arguments: [address]
      });
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      throw error;
    }
  }

  /**
   * Get agent details
   * @param agentId Agent ID
   * @returns Agent details
   */
  async getAgent(agentId: string): Promise<Types.MoveValue> {
    try {
      return await this.client.view({
        function: `${this.moduleAddress}::agent_framework::get_agent`,
        type_arguments: [],
        arguments: [agentId]
      });
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  /**
   * Get user recommendations
   * @param userAddress User address
   * @returns Recommendations for the user
   */
  async getRecommendations(userAddress: string): Promise<Types.MoveValue> {
    try {
      return await this.client.view({
        function: `${this.moduleAddress}::recommendation_engine::get_recommendations`,
        type_arguments: [],
        arguments: [userAddress]
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  /**
   * Get content reputation
   * @param contentId Content ID
   * @returns Content reputation data
   */
  async getContentReputation(contentId: string): Promise<Types.MoveValue> {
    try {
      return await this.client.view({
        function: `${this.moduleAddress}::reputation_system::get_content_reputation`,
        type_arguments: [],
        arguments: [contentId]
      });
    } catch (error) {
      console.error('Error fetching content reputation:', error);
      throw error;
    }
  }

  /**
   * Get total supply of tokens
   * @returns Total token supply
   */
  async getTotalSupply(): Promise<Types.MoveValue> {
    try {
      return await this.client.view({
        function: `${this.moduleAddress}::token_economics::get_total_supply`,
        type_arguments: [],
        arguments: []
      });
    } catch (error) {
      console.error('Error fetching total supply:', error);
      throw error;
    }
  }

  /**
   * Check if user has rated content
   * @param userAddress User address
   * @param contentId Content ID
   * @returns Whether the user has rated the content
   */
  async hasUserRated(userAddress: string, contentId: string): Promise<boolean> {
    try {
      const response = await this.client.view({
        function: `${this.moduleAddress}::reputation_system::has_user_rated`,
        type_arguments: [],
        arguments: [userAddress, contentId]
      });
      return response as boolean;
    } catch (error) {
      console.error('Error checking if user has rated:', error);
      throw error;
    }
  }

  /**
   * Helper to format a transaction payload
   * @param func Function name
   * @param args Arguments
   * @returns Transaction payload
   */
  formatTransactionPayload(func: string, args: any[]): Types.TransactionPayload {
    return {
      type: 'entry_function_payload',
      function: `${this.moduleAddress}::${func}`,
      type_arguments: [],
      arguments: args
    };
  }
}

export default AptosAgoraService; 