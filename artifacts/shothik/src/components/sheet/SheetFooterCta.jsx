import React from "react";
import { CheckCircle, User } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import EmailModal from "@/components/(primary-layout)/(home-v2-page)/(home-components)/EmailCollectModal";
import { useRegisterUserToBetaListMutation } from "@/redux/api/auth/authApi";

export const FooterCta = ({ isMobile, showModal, setShowModal }) => {
  const [
    registerUserForBetaList,
    { isLoading: registerUserProcessing, isError: registerUserError },
  ] = useRegisterUserToBetaListMutation();

  const handleEmailSubmit = async (email) => {
    try {
      const result = await registerUserForBetaList({ email }).unwrap();


      // Success toast
      toast.success("Successfully registered for beta!", {
        description: "We'll be in touch soon.",
      });

      // Close the modal
      setShowModal(false);
    } catch (error) {
      // Error toast
      toast.error("Registration failed", {
        description:
          error?.data?.message || "Registration failed. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="bg-secondary w-full max-w-[1000px] px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div
            className={`flex w-full flex-wrap items-center justify-between gap-4 ${
              isMobile ? "flex-col items-start" : "flex-row"
            }`}
          >
            {/* Left side - Icon and text */}
            <div className="flex flex-1 items-center gap-3">
              <CheckCircle className="text-primary h-5 w-5 shrink-0" />
              <p className="text-foreground text-sm leading-tight font-medium">
                Shothik task replay completed.
              </p>
            </div>
            {/* Right side - Action buttons */}
            <div
              className={`flex shrink-0 gap-3 ${isMobile ? "w-full" : "w-auto"}`}
            >
              <Button
                // data-umami-event="Modal: Join the waitlist"
                data-rybbit-event="Modal: Join the waitlist"
                onClick={() => {
                  setShowModal(true);
                }}
                className={`bg-primary hover:bg-primary/90 text-primary-foreground min-h-9 rounded-lg px-4 py-2 text-sm font-medium ${
                  isMobile ? "flex-1" : ""
                }`}
              >
                <User className="mr-2 h-4 w-4" />
                Join the waitlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* email modal */}
      <EmailModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleEmailSubmit}
      />
    </>
  );
};

export default FooterCta;
