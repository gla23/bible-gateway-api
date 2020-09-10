interface BibleGatewayResult {
    verse: string;
    content: Array<string>;
}
declare class BibleGatewayAPI {
    private parse;
    constructor();
    search(query?: string, version?: string): Promise<BibleGatewayResult>;
}
export { BibleGatewayAPI };
export default BibleGatewayAPI;
