from circuitbreaker import circuit
import logging
from typing import Any, Dict, Optional
import stripe
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class StripeCircuitBreaker:
    """Circuit breaker wrapper for Stripe API calls"""
    
    def __init__(self):
        self.failure_threshold = 5
        self.recovery_timeout = 30
        self.expected_exception = (stripe.error.StripeError, Exception)
    
    @circuit(failure_threshold=5, recovery_timeout=30, expected_exception=(stripe.error.StripeError, Exception))
    def create_payment_intent(self, amount: int, currency: str = "usd", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a Stripe payment intent with circuit breaker protection"""
        try:
            logger.info(f"Creating payment intent for amount: {amount} {currency}")
            
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            logger.info(f"Payment intent created successfully: {intent.id}")
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "status": intent.status
            }
            
        except stripe.error.CardError as e:
            logger.error(f"Card error: {e.user_message}")
            raise
        except stripe.error.RateLimitError as e:
            logger.error(f"Rate limit error: {str(e)}")
            raise
        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid request error: {str(e)}")
            raise
        except stripe.error.AuthenticationError as e:
            logger.error(f"Authentication error: {str(e)}")
            raise
        except stripe.error.APIConnectionError as e:
            logger.error(f"API connection error: {str(e)}")
            raise
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in payment intent creation: {str(e)}")
            raise
    
    @circuit(failure_threshold=5, recovery_timeout=30, expected_exception=(stripe.error.StripeError, Exception))
    def retrieve_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """Retrieve a Stripe payment intent with circuit breaker protection"""
        try:
            logger.info(f"Retrieving payment intent: {payment_intent_id}")
            
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "id": intent.id,
                "status": intent.status,
                "amount": intent.amount,
                "currency": intent.currency,
                "metadata": intent.metadata
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error retrieving payment intent: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error retrieving payment intent: {str(e)}")
            raise
    
    @circuit(failure_threshold=5, recovery_timeout=30, expected_exception=(stripe.error.StripeError, Exception))
    def create_customer(self, email: str, name: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a Stripe customer with circuit breaker protection"""
        try:
            logger.info(f"Creating Stripe customer for email: {email}")
            
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata=metadata or {}
            )
            
            logger.info(f"Customer created successfully: {customer.id}")
            return {
                "customer_id": customer.id,
                "email": customer.email,
                "name": customer.name
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating customer: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating customer: {str(e)}")
            raise
    
    @circuit(failure_threshold=5, recovery_timeout=30, expected_exception=(stripe.error.StripeError, Exception))
    def create_subscription(self, customer_id: str, price_id: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a Stripe subscription with circuit breaker protection"""
        try:
            logger.info(f"Creating subscription for customer: {customer_id}")
            
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{
                    'price': price_id,
                }],
                metadata=metadata or {}
            )
            
            logger.info(f"Subscription created successfully: {subscription.id}")
            return {
                "subscription_id": subscription.id,
                "status": subscription.status,
                "current_period_end": subscription.current_period_end
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating subscription: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating subscription: {str(e)}")
            raise
    
    def handle_circuit_open(self, operation_name: str) -> Dict[str, Any]:
        """Handle circuit breaker open state"""
        logger.warning(f"Circuit breaker is OPEN for {operation_name}. Service temporarily unavailable.")
        return {
            "error": "Payment service temporarily unavailable",
            "message": "Please try again in a few moments",
            "retry_after": self.recovery_timeout
        }
    
    def is_circuit_open(self) -> bool:
        """Check if any circuit breaker is in open state"""
        # This is a simplified check - in practice you might want to track individual circuit states
        try:
            # Try a simple operation to test circuit state
            stripe.Account.retrieve()
            return False
        except Exception:
            return True

# Global instance
stripe_circuit_breaker = StripeCircuitBreaker()