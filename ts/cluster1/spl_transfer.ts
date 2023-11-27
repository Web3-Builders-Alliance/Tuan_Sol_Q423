import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("9xXa31Mnqxsnhd27uz4UTyrztzHA2f15bqb2dJ3puPhD");

// Recipient address
const to = new PublicKey("7ZsXMgLFxb2diaU92zsrfvpoCeUBhiSZPG6tZ73LV7Zn");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        let fromWalletATA = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey)

        // Get the token account of the toWallet address, and if it does not exist, create it
        let toWalletATA = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to)

        // Transfer the new token to the "toTokenAccount" we just created
        let txId = await transfer(connection, keypair, fromWalletATA.address, toWalletATA.address, keypair, 1)
        console.log("Your transfer txId:", txId)
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();