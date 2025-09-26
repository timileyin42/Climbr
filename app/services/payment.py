from typing import Dict, Any, Optional
from datetime import datetime
import os
import stripe
import logging
from sqlalchemy.orm import Session
from app.models.database_models import Payment, Employer, Trainer
from app.services.circuit_breaker import stripe_circuit_breaker
from circuitbreaker import CircuitBreakerError

# Stripe API configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

logger = logging.getLogger(__name__)

class PaymentService:
    """
    Service for handling payment processing with Stripe.
    """
    
    @staticmethod
    async def create_payment_intent(amount: float, currency: str = "GBP", customer_email: str = None, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a Stripe payment intent.
        
        Args:
            amount: Payment amount in the currency's smallest unit (e.g., pence for GBP)
            currency: Payment currency (default: GBP)
            customer_email: Customer email address
            metadata: Additional metadata for the payment
            
        Returns:
            Dict containing payment intent response
        """
        if not stripe.api_key:
            logger.error("STRIPE_SECRET_KEY is not set. Payment processing is disabled.")
            raise ValueError("Payment processing is not configured")
            
        if not customer_email:
            raise ValueError("Customer email is required for payment processing")
            
        # Convert amount to smallest currency unit (pence for GBP, cents for USD)
        amount_in_smallest_unit = int(amount * 100)
        
        try:
            # Use circuit breaker for Stripe API call
            result = stripe_circuit_breaker.create_payment_intent(
                amount=amount_in_smallest_unit,
                currency=currency.lower(),
                metadata={
                    **(metadata or {}),
                    "customer_email": customer_email
                }
            )
            
            return {
                "success": True,
                "client_secret": result["client_secret"],
                "payment_intent_id": result["payment_intent_id"],
                "status": result["status"]
            }
            
        except CircuitBreakerError:
            logger.warning("Payment service circuit breaker is open")
            return stripe_circuit_breaker.handle_circuit_open("create_payment_intent")
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return {
                "success": False,
                "error": "Payment processing error",
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected payment error: {str(e)}")
            return {
                "success": False,
                "error": "Payment processing failed",
                "message": "An unexpected error occurred"
            }
            logger.error(f"Stripe error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Error processing payment: {str(e)}")
            return {
                "success": False,
                "error": f"Payment processing error: {str(e)}"
            }
    
    @staticmethod
    async def get_payment_status(payment_id: str) -> Dict[str, Any]:
        """
        Get the status of a payment using Stripe API.
        
        Args:
            payment_id: The payment intent ID to check
            
        Returns:
            Dict containing payment status information
        """
        if not stripe.api_key:
            logger.error("STRIPE_SECRET_KEY is not set. Payment status check is disabled.")
            raise ValueError("Payment processing is not configured")
            
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            return {
                "payment_id": payment_id,
                "status": payment_intent.status,
                "amount": payment_intent.amount / 100,  # Convert from smallest unit to main currency
                "currency": payment_intent.currency.upper(),
                "payment_method": payment_intent.payment_method,
                "created": datetime.fromtimestamp(payment_intent.created),
                "customer": {
                    "email": payment_intent.receipt_email or ""
                },
                "timestamp": datetime.now()
            }
                    
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return {
                "payment_id": payment_id,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error checking payment status: {str(e)}")
            return {
                "payment_id": payment_id,
                "status": "error",
                "error": f"Payment status check error: {str(e)}",
                "timestamp": datetime.now()
            }
    
    @staticmethod
    async def refund_payment(payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Refund a payment using Stripe API.
        
        Args:
            payment_id: The payment intent ID to refund
            amount: The amount to refund (if None, refund the full amount)
            
        Returns:
            Dict containing refund result information
        """
        if not stripe.api_key:
            logger.error("STRIPE_SECRET_KEY is not set. Payment refund is disabled.")
            raise ValueError("Payment processing is not configured")
            
        try:
            # First, verify the payment intent to get details
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            if payment_intent.status != "succeeded":
                return {
                    "success": False,
                    "payment_id": payment_id,
                    "error": "Cannot refund a payment that has not succeeded",
                    "timestamp": datetime.now()
                }
            
            # Prepare refund data
            refund_data = {
                "payment_intent": payment_id
            }
            
            # If specific amount is provided, convert to smallest currency unit
            if amount is not None:
                refund_data["amount"] = int(amount * 100)  # Convert to smallest unit
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                "success": True,
                "refund_id": refund.id,
                "payment_id": payment_id,
                "amount": refund.amount / 100,  # Convert from smallest unit to main currency
                "currency": refund.currency.upper(),
                "timestamp": datetime.now(),
                "status": refund.status
            }
                    
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return {
                "success": False,
                "payment_id": payment_id,
                "error": str(e),
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error processing refund: {str(e)}")
            return {
                "success": False,
                "payment_id": payment_id,
                "error": f"Refund processing error: {str(e)}",
                "timestamp": datetime.now()
            }