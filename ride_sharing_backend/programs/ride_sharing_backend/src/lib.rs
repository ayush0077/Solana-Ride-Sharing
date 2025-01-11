#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

declare_id!("AnJdWxJnazJTyFyHVLs3xheiu9rKHuwpPKpu52YBBaey"); // Replace this with the deployed program ID


#[program]
pub mod ride_sharing {
    use super::*;

    // Initialize a new ride
    pub fn create_ride(ctx: Context<CreateRide>, fare: u64) -> Result<()> {
        let ride = &mut ctx.accounts.ride;
        ride.rider = *ctx.accounts.rider.key;
        ride.driver = Pubkey::default(); // Default initialization for driver
        ride.fare = fare;
        ride.status = RideStatus::Requested;
        msg!("🚀 New ride created! Rider: {:?}", ride.rider);
        msg!("💸 Fare for the ride is: {}", ride.fare);
        Ok(())
    }

    // Accept a ride request
    pub fn accept_ride(ctx: Context<AcceptRide>) -> Result<()> {
        let ride = &mut ctx.accounts.ride;

        // Ensure the ride is in the 'Requested' state
        if ride.status != RideStatus::Requested {
            return Err(error!(RideError::InvalidRideState));
        }

        ride.driver = *ctx.accounts.driver.key;
        ride.status = RideStatus::Accepted;
        msg!("🚗 Ride accepted by driver: {:?}", ride.driver);
        Ok(())
    }

    // Complete the ride
    pub fn complete_ride(ctx: Context<CompleteRide>) -> Result<()> {
        let ride = &mut ctx.accounts.ride;

        // Ensure the ride is in the 'Accepted' state
        if ride.status != RideStatus::Accepted {
            return Err(error!(RideError::InvalidRideState));
        }

        ride.status = RideStatus::Completed;
        msg!("✅ Ride completed successfully!");
        Ok(())
    }

    // Cancel the ride
    pub fn cancel_ride(ctx: Context<CancelRide>, by_rider: bool) -> Result<()> {
        let ride = &mut ctx.accounts.ride;

        // Prevent cancellation if the ride is already completed
        if ride.status == RideStatus::Completed {
            return Err(error!(RideError::RideAlreadyCompleted));
        }

        ride.status = RideStatus::Cancelled;
        if by_rider {
            msg!("❌ Ride cancelled by the rider.");
        } else {
            msg!("❌ Ride cancelled by the driver.");
        }
        Ok(())
    }
}

// Contexts
#[derive(Accounts)]
pub struct CreateRide<'info> {
    #[account(init, payer = rider, space = 8 + 32 + 32 + 8 + 1)]
    pub ride: Account<'info, Ride>,
    #[account(mut)]
    pub rider: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptRide<'info> {
    #[account(mut)]
    pub ride: Account<'info, Ride>,
    #[account(mut)]
    pub driver: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteRide<'info> {
    #[account(mut)]
    pub ride: Account<'info, Ride>,
}

#[derive(Accounts)]
pub struct CancelRide<'info> {
    #[account(mut)]
    pub ride: Account<'info, Ride>,
    pub user: Signer<'info>,
}

// Data Models
#[account]
pub struct Ride {
    pub rider: Pubkey,
    pub driver: Pubkey, // Default initialized as Pubkey::default()
    pub fare: u64,
    pub status: RideStatus,
}

#[derive(Clone, Copy, Debug, PartialEq, AnchorSerialize, AnchorDeserialize)]
pub enum RideStatus {
    Requested,
    Accepted,
    Completed,
    Cancelled,
}

// Error Codes
#[error_code]
pub enum RideError {
    RideAlreadyCompleted,
    InvalidRideState,
}
