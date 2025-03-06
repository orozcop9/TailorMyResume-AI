
// Previous imports remain the same...

export function OnboardingForm() {
  // Previous state and functions remain the same...

  const handleNextStep = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!validatePaymentFields()) {
        return;
      }

      setIsProcessing(true);
      setPaymentError("");

      try {
        if (formData.selectedPlan !== "free") {
          const clientSecret = await createPaymentIntent();
          const stripe = await getStripe();
          
          if (!stripe || !clientSecret) {
            throw new Error("Stripe initialization failed");
          }

          const { error } = await stripe.confirmPayment({
            elements: {
              payment_method: {
                card: {
                  number: formData.cardNumber.replace(/\s/g, ""),
                  exp_month: parseInt(formData.expiryDate.split("/")[0]),
                  exp_year: parseInt("20" + formData.expiryDate.split("/")[1]),
                  cvc: formData.cvv,
                },
              },
            },
            clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/onboarding/success`,
            },
          });

          if (error) {
            throw new Error(error.message);
          }
        }

        router.push("/onboarding/success");
      } catch (error) {
        console.error("Payment error:", error);
        setPaymentError(error instanceof Error ? error.message : "Payment failed");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Rest of the component remains the same...
}
