import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { RideSharing } from "../target/types/ride_sharing";
import * as assert from "assert";

describe("ride_sharing_backend", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RideSharing as Program<RideSharing>;

  let rideAccount: anchor.web3.Keypair;

  // Initialize a ride account before each test
  beforeEach(async () => {
    rideAccount = anchor.web3.Keypair.generate();

    // Airdrop SOL to the payer (rider) account
    const airdropSignature = await provider.connection.requestAirdrop(
      provider.wallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 2 SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Create and initialize the ride account
    await program.methods
      .createRide(new anchor.BN(1000)) // Fare: 1000
      .accounts({
        ride: rideAccount.publicKey,
        rider: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([rideAccount])
      .rpc();
  });

  it("Is initialized!", async () => {
    // Fetch the ride account data
    const rideAccountData = await program.account.ride.fetch(rideAccount.publicKey);

    // Assertions
    assert.equal(rideAccountData.fare.toString(), "1000", "Fare does not match");
    assert.deepEqual(rideAccountData.status, { requested: {} }, "Status is not 'Requested'");
  });

  it("Driver accepts the ride", async () => {
    const driverAccount = anchor.web3.Keypair.generate();

    // Airdrop SOL to the driver
    const airdropSignature = await provider.connection.requestAirdrop(
      driverAccount.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Call the accept_ride method
    const tx = await program.methods
      .acceptRide()
      .accounts({
        ride: rideAccount.publicKey,
        driver: driverAccount.publicKey,
      })
      .signers([driverAccount])
      .rpc();

    console.log("Transaction successful, signature:", tx);

    // Fetch the updated ride account data
    const rideAccountData = await program.account.ride.fetch(rideAccount.publicKey);

    // Assertions
    assert.equal(
      rideAccountData.driver.toBase58(),
      driverAccount.publicKey.toBase58(),
      "Driver public key does not match"
    );
    assert.deepEqual(rideAccountData.status, { accepted: {} }, "Status is not 'Accepted'");
  });

  it("Ride is completed", async () => {
    const driverAccount = anchor.web3.Keypair.generate();
  
    // Airdrop SOL to the driver
    const airdropSignature = await provider.connection.requestAirdrop(
      driverAccount.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);
  
    // Accept the ride first
    await program.methods
      .acceptRide()
      .accounts({
        ride: rideAccount.publicKey,
        driver: driverAccount.publicKey,
      })
      .signers([driverAccount])
      .rpc();
  
    console.log("Ride accepted successfully!");
  
    // Call the complete_ride method
    const tx = await program.methods
      .completeRide()
      .accounts({
        ride: rideAccount.publicKey,
      })
      .rpc();
  
    console.log("Transaction successful, signature:", tx);
  
    // Fetch the updated ride account data
    const rideAccountData = await program.account.ride.fetch(rideAccount.publicKey);
  
    // Assertions
    assert.deepEqual(rideAccountData.status, { completed: {} }, "Status is not 'Completed'");
  });
  

  it("Ride is cancelled by the rider", async () => {
    // Call the cancel_ride method
    const tx = await program.methods
      .cancelRide(true) // true indicates the rider is cancelling the ride
      .accounts({
        ride: rideAccount.publicKey,
        user: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Transaction successful, signature:", tx);

    // Fetch the updated ride account data
    const rideAccountData = await program.account.ride.fetch(rideAccount.publicKey);

    // Assertions
    assert.deepEqual(rideAccountData.status, { cancelled: {} }, "Status is not 'Cancelled'");
  });
});
