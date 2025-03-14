export const fetchTokenPrice = async (chainId: number): Promise<number> => {
    const rpcUrl = 'https://rpc.particle.network/evm-chain';
    const authUsername = process.env.NEXT_PUBLIC_PROJECT_ID!;
    const authPassword = process.env.NEXT_PUBLIC_SERVER_KEY!;

    try {
        if (!chainId) {
            throw new Error("Chain ID is required to fetch the token price");
        }

        const requestBody = {
            chainId: chainId,
            jsonrpc: '2.0',
            id: 1,
            method: 'particle_getPrice',
            params: [
                ['native'], // Querying for the native token
                ['usd'], // Conversion currency
            ],
        };

        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${authUsername}:${authPassword}`),
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const data = await response.json();
            //console.log(data.result[0].currencies[0].price)
            return parseFloat(data.result[0].currencies[0].price);

        } else {
            console.error("Error fetching token price:", response.status, response.statusText);
            return 0;
        }
    } catch (error) {
        console.error("Error in token price fetch:", error);
        return 0;
    }
};
