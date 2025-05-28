import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import base58 from "bs58";

// const connection = new Connection(
//   "https://api.mainnet-beta.solana.com",
//   "finalized"
// );

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function sendSol(to: string, amount: string) {
  // send out the user some sol
  const keypair = Keypair.fromSecretKey(
    base58.decode(process.env.SOL_PRIVATE_KEY ?? "")
  );
  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(to),
      lamports: parseFloat(amount) * LAMPORTS_PER_SOL, //0.1 => 10^8 lamports
    })
  );

  await sendAndConfirmTransaction(connection, transferTransaction, [keypair]);
  console.log("sol sent");
}
