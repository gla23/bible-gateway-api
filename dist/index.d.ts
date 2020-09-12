export interface BibleGatewayResult {
    verse: string;
    content: Array<string>;
}
declare class BibleGatewayAPI {
    private parse;
    constructor();
    private parsePage;
    search(query?: string, version?: string, useCors?: boolean): Promise<BibleGatewayResult>;
    searchUrl(url: string): Promise<BibleGatewayResult>;
}
export { BibleGatewayAPI };
export default BibleGatewayAPI;
