/**
 * Component for creating a trip based on user preferences.
 * 
 * Allows users to:
 * - Select a destination using Google Places Autocomplete.
 * - Specify trip duration, budget, and companions.
 * - Generate a customized itinerary.
 */

import React, { useContext, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { chatSession } from "@/Service/AiModel";
import { LogInContext } from "@/Context/LogInContext/Login";
import { db } from "@/Service/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  PROMPT,
  SelectBudgetOptions,
  SelectNoOfPersons,
} from "../../constants/Options";

function CreateTrip() {
  // State hooks
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, loginWithPopup, isAuthenticated } = useContext(LogInContext);

  /**
   * Updates the form data with the given field and value.
   * @param {string} name - The field name.
   * @param {any} value - The field value.
   */
  const handleInputChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  /**
   * Handles user sign-in via Google Authentication.
   */
  const signIn = async () => {
    loginWithPopup();
  };

  /**
   * Saves user data to Firestore after login.
   */
  const saveUser = async () => {
    const userData = JSON.parse(localStorage.getItem("User"));
    if (userData?.email) {
      await setDoc(doc(db, "Users", userData.email), {
        userName: userData.name,
        userEmail: userData.email,
        userPicture: userData.picture,
        userNickname: userData.nickname,
      });
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem("User", JSON.stringify(user));
      saveUser();
    }
  }, [user, isAuthenticated]);

  /**
   * Saves generated trip data to Firestore and redirects to the "My Trips" page.
   * @param {Object} tripData - The generated trip data.
   */
  const saveTrip = async (tripData) => {
    const userData = JSON.parse(localStorage.getItem("User"));
    const tripId = Date.now().toString();

    setIsLoading(true);
    await setDoc(doc(db, "Trips", tripId), {
      tripId,
      userSelection: formData,
      tripData,
      userName: userData?.name,
      userEmail: userData?.email,
    });
    setIsLoading(false);

    localStorage.setItem("Trip", JSON.stringify(tripData));
    navigate(`/my-trips/${tripId}`);
  };

  /**
   * Generates a trip itinerary based on user preferences.
   */
  const generateTrip = async () => {
    if (!isAuthenticated) {
      toast("Sign In to continue", { icon: "⚠️" });
      return setIsDialogOpen(true);
    }

    const { noOfDays, location, People, Budget } = formData;

    if (!noOfDays || !location || !People || !Budget) {
      return toast.error("Please fill out every field or select every option.");
    }

    if (noOfDays > 5) return toast.error("Please enter Trip Days less than 5.");
    if (noOfDays < 1) return toast.error("Invalid number of Days.");

    const FINAL_PROMPT = PROMPT.replace(/{location}/g, location)
      .replace(/{noOfDays}/g, noOfDays)
      .replace(/{People}/g, People)
      .replace(/{Budget}/g, Budget);

    try {
      const toastId = toast.loading("Generating Trip", { icon: "✈️" });
      setIsLoading(true);

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const trip = JSON.parse(result.response.text());

      setIsLoading(false);
      saveTrip(trip);

      toast.dismiss(toastId);
      toast.success("Trip Generated Successfully");
    } catch (error) {
      setIsLoading(false);
      toast.dismiss();
      toast.error("Failed to generate trip. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="mt-10">
      {/* Heading Section */}
      <div className="text text-center md:text-left">
        <h2 className="text-2xl md:text-4xl font-bold">
          Share Your Travel Preferences 🌟🚀
        </h2>
        <p className="text-sm text-gray-600 font-medium mt-3">
          Help us craft your perfect adventure with just a few details.
          Travel Genius will generate a tailored itinerary based on your preferences.
        </p>
      </div>

      {/* Form Section */}
      <div className="form mt-10 flex flex-col gap-10 md:gap-20">
        {/* Destination */}
        <div className="place">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            Where do you want to Explore? 🏖️
          </h2>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
            selectProps={{
              value: place,
              onChange: (place) => {
                setPlace(place);
                handleInputChange("location", place.label);
              },
            }}
          />
        </div>

        {/* Duration */}
        <div className="day">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            How long is your Trip? 🕜
          </h2>
          <Input
            placeholder="Ex: 2"
            type="number"
            onChange={(e) => handleInputChange("noOfDays", e.target.value)}
          />
        </div>

        {/* Budget */}
        <div className="budget">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            What is your Budget? 💳
          </h2>
          <div className="options grid grid-cols-1 gap-5 md:grid-cols-3 cursor-pointer">
            {SelectBudgetOptions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleInputChange("Budget", item.title)}
                className={`option transition-all hover:scale-110 p-4 h-32 flex items-center justify-center flex-col border rounded-lg hover:shadow-lg
                  ${formData?.Budget === item.title && "border-black shadow-xl"}`}
              >
                <h3 className="font-bold text-[15px] md:font-[18px]">
                  {item.icon} {item.title} :
                </h3>
                <p className="text-gray-500 font-medium">{item.desc}</p>
                <p>{item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Companions */}
        <div className="people">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            Who are you traveling with? 🚗
          </h2>
          <div className="options grid grid-cols-1 gap-5 md:grid-cols-3 cursor-pointer">
            {SelectNoOfPersons.map((item) => (
              <div
                key={item.id}
                onClick={() => handleInputChange("People", item.no)}
                className={`option transition-all hover:scale-110 p-4 h-32 flex items-center justify-center flex-col border rounded-lg hover:shadow-lg
                  ${formData?.People === item.no && "border-black shadow-xl"}`}
              >
                <h3 className="font-bold text-[15px] md:font-[18px]">
                  {item.icon} {item.title} :
                </h3>
                <p className="text-gray-500 font-medium">{item.desc}</p>
                <p className="text-gray-500 text-sm font-normal">{item.no}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Trip Button */}
      <div className="create-trip-btn w-full flex items-center justify-center h-32">
        <Button disabled={isLoading} onClick={generateTrip}>
          {isLoading ? (
            <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
          ) : (
            "Plan A Trip"
          )}
        </Button>
      </div>

      {/* Dialog for Sign-In */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {user ? "Thank you for Logging In" : "Sign In to Continue"}
            </DialogTitle>
            <DialogDescription>
              {user ? (
                "Logged In Securely to Travel Genius with Google Authentication"
              ) : (
                <Button
                  onClick={signIn}
                  className="w-full mt-5 flex gap-2 items-center justify-center"
                >
                  Sign In with <FcGoogle className="h-5 w-5" />
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="w-full">
              <DialogClose>Close</DialogClose>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
