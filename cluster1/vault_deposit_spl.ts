import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@coral-xyz/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "finalized";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(IDL, "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address, provider);

// Create a random keypair
const vaultState = new PublicKey("GTomrV84NzZpGGczvgWapykPmW9YDzLaS9kFHwz1MECm");

// Create the PDA for our enrollment account
const vaultAuth = PublicKey.findProgramAddressSync([Buffer.from("auth"), vaultState.toBuffer()], program.programId)[0];

// Create the vault key
const vault = PublicKey.findProgramAddressSync([Buffer.from("vault"), vaultAuth.toBuffer()], program.programId)[0];

const token_decimals = 100_000_000n

// Mint address
const mint = new PublicKey("9xXa31Mnqxsnhd27uz4UTyrztzHA2f15bqb2dJ3puPhD");

// Execute our enrollment transaction
(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true,
      commitment
    );

    const signature = await program.methods
    .depositSpl(new BN(1))
    .accounts({
        owner: keypair.publicKey,
        vaultState,
        vaultAuth,
        systemProgram: SystemProgram.programId,
        ownerAta: ownerAta.address,
        vaultAta: vaultAta.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    })
    .signers([
        keypair
    ]).rpc();
    console.log(`Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
    // https://explorer.solana.com/tx/2MXXBhzRXoGmB8mdwpzWESRbTyRsqddracJao2Epu2EH76VpfobyunEcRDDDuBrMXE6wRJsvWPf6bsJJSALNxGVK?cluster=devnet
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
