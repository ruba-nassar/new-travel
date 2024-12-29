import { Input } from "@/components/ui/input"; // Importing custom Input component
import React, { useContext, useEffect, useState } from "react"; // React core imports
import GooglePlacesAutocomplete from "react-google-places-autocomplete"; // For handling Google Places autocomplete
import {
  PROMPT, // Importing constants for predefined prompt text
  SelectBudgetOptions, // Options for budget selection
  SelectNoOfPersons, // Options for the number of persons
} from "../../constants/Options"; // Importing constants from Options
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"; // Custom Dialog components
import { FcGoogle } from "react-icons/fc"; // Google icon for Sign In
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Loading spinner icon
import { Button } from "@/components/ui/button"; // Custom Button component
import toast from "react-hot-toast"; // To display toast notifications
import { chatSession } from "@/Service/AiModel"; // AI service for generating trip data

import { LogInContext } from "@/Context/LogInContext/Login"; // Context to manage login state

import { db } from "@/Service/Firebase"; // Firebase service to interact with Firestore
import { doc, setDoc } from "firebase/firestore"; // Firebase Firestore functions
import { useNavigate } from "react-router-dom"; // React Router for navigation
import DatePicker from "react-datepicker"; // For handling date range selection
import "react-datepicker/dist/react-datepicker.css"; // Importing styles for date picker

function CreateTrip() {
  // State variables
  const [place, setPlace] = useState(""); // Store selected place
  const [formData, setFormData] = useState([]); // Store user-selected form data
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Manage dialog visibility
  const [isLoading, setIsLoading] = useState(false); // Handle loading state
  const [startDate, setStartDate] = useState(null); // Store start date
  const [endDate, setEndDate] = useState(null); // Store end date
  const navigate = useNavigate(); // For navigation after trip creation

  const { user, loginWithPopup, isAuthenticated } = useContext(LogInContext); // Use login context for user authentication

  // Function to handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Function to trigger sign-in process
  const SignIn = async () => {
    loginWithPopup(); // Initiates Google sign-in popup
  };

  // Save user data to Firestore
  const SaveUser = async () => {
    const User = JSON.parse(localStorage.getItem("User")); // Retrieve user from localStorage
    const id = User?.email; // User ID based on email
    await setDoc(doc(db, "Users", id), { // Set user document in Firestore
      userName: User?.name,
      userEmail: User?.email,
      userPicture: User?.picture,
      userNickname: User?.nickname,
    });
  };

  // Effect hook to handle user login and saving data to Firestore
  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem("User", JSON.stringify(user)); // Store user data in localStorage
      SaveUser(); // Save user data to Firestore
    }
  }, [user]); // Runs when user data is updated

  // Save trip data to Firestore
  const SaveTrip = async (TripData) => {
    const User = JSON.parse(localStorage.getItem("User")); // Retrieve user data
    const id = Date.now().toString(); // Generate unique trip ID based on timestamp
    setIsLoading(true); // Set loading state
    await setDoc(doc(db, "Trips", id), { // Save trip data to Firestore
      tripId: id,
      userSelection: formData,
      tripData: TripData,
      userName: User?.name,
      userEmail: User?.email,
    });
    setIsLoading(false); // Reset loading state
    localStorage.setItem('Trip', JSON.stringify(TripData)); // Store trip data in localStorage
    navigate('/my-trips/' + id); // Redirect to trip details page
  };

  // Function to generate trip based on user input
  const generateTrip = async () => {
    if (!isAuthenticated) {
      toast("Sign In to continue", { // Toast message if not authenticated
        icon: "⚠️",
      });
      return setIsDialogOpen(true); // Open dialog for sign-in
    }
    if (
      !formData?.noOfDays ||
      !formData?.location ||
      !formData?.People ||
      !formData?.Budget
    ) {
      return toast.error("Please fill out every field or select every option."); // Error if any field is missing
    }
    if (formData?.noOfDays > 10) {
      return toast.error("Please enter Trip Days less than 10"); // Error if days are more than 10
    }
    if (formData?.noOfDays < 1) {
      return toast.error("Invalid number of Days"); // Error for invalid number of days
    }

    // Format the final prompt for the AI model
    const FINAL_PROMPT = PROMPT.replace(/{location}/g, formData?.location)
      .replace(/{noOfDays}/g, formData?.noOfDays)
      .replace(/{People}/g, formData?.People)
      .replace(/{Budget}/g, formData?.Budget);

    try {
      const toastId = toast.loading("Generating Trip", { // Show loading toast
        icon: "✈️",
      });

      setIsLoading(true); // Set loading state
      const result = await chatSession.sendMessage(FINAL_PROMPT); // Send prompt to AI model
      const trip = JSON.parse(result.response.text()); // Parse the response as trip data
      setIsLoading(false); // Reset loading state
      SaveTrip(trip); // Save the generated trip

      toast.dismiss(toastId); // Dismiss loading toast
      toast.success("Trip Generated Successfully"); // Success toast
    } catch (error) {
      setIsLoading(false); // Reset loading state on error
      toast.dismiss(); // Dismiss toast
      toast.error("Failed to generate trip. Please try again."); // Error toast
      console.error(error); // Log the error
    }
  };

  // Handle date range selection
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Calculate duration in days
      handleInputChange("noOfDays", duration); // Update days in form data
    }
  };

  return (
    <div className="mt-10">
      {/* Header and description */}
      <div className="text text-center md:text-left">
        <h2 className="text-2xl md:text-4xl font-bold">
          Share Your Travel Preferences 🌟🚀
        </h2>
        <p className="text-sm text-gray-600 font-medium mt-3">
          Help us craft your perfect adventure with just a few details.
          Travel Genius will generate a tailored itinerary based on your
          preferences.
        </p>
      </div>

      {/* Form to gather trip preferences */}
      <div className="form mt-10 flex flex-col gap-10 md:gap-20 ">
        {/* Location selection */}
        <div className="place border p-4 rounded-lg">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            Where do you want to Explore? 🏖️
          </h2>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
            selectProps={{
              value: place,
              onChange: (place) => {
                setPlace(place); // Set the selected place
                handleInputChange("location", place.label); // Update form data
              },
            }}
          />
        </div>

        {/* Date range selection */}
        <div className="day border p-4 rounded-lg">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            How long is your Trip? 🕜
          </h2>
          <DatePicker
            selected={startDate}
            onChange={(dates) => handleDateChange(dates[0], dates[1])} // Handle date change
            startDate={startDate}
            endDate={endDate}
            selectsRange
            placeholderText="Select trip duration"
          />
        </div>

        {/* Budget selection */}
        <div className="budget border p-4 rounded-lg">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            What is your Budget? 💳
          </h2>
          <div className="options grid grid-cols-1 gap-5 md:grid-cols-3 cursor-pointer">
            {SelectBudgetOptions.map((item) => {
              return (
                <div
                  onClick={(e) => handleInputChange("Budget", item.title)} // Handle budget selection
                  key={item.id}
                  className={`option transition-all hover:scale-110 p-4 h-32 flex items-center justify-center flex-col border rounded-lg hover:shadow-lg
                  ${formData?.Budget == item.title && "border-black shadow-xl"}
                  `}
                >
                  <h3 className="font-bold text-[15px] md:font-[18px]">
                    {item.icon} {item.title} :
                  </h3>
                  <p className="text-gray-500 font-medium">{item.desc}</p>
                  <p>{item.price}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* People selection */}
        <div className="people border p-4 rounded-lg">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            Who are you traveling with? 🚗
          </h2>
          <div className="options grid grid-cols-1 gap-5 md:grid-cols-3 cursor-pointer">
            {SelectNoOfPersons.map((item) => {
              return (
                <div
                  onClick={(e) => handleInputChange("People", item.no)} // Handle number of people selection
                  key={item.id}
                  className={`option transition-all hover:scale-110 p-4 h-32 flex items-center justify-center flex-col border rounded-lg hover:shadow-lg
                    ${
                      formData?.People == item.no &&
                      "border border-black shadow-xl"
                    }
                  `}
                >
                  <h3 className="font-bold text-[15px] md:font-[18px]">
                    {item.icon} {item.title} :
                  </h3>
                  <p className="text-gray-500 font-medium">{item.desc}</p>
                  <p className="text-gray-500 text-sm font-normal">{item.no}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="create-trip-btn w-full flex items-center justify-center h-32">
        <Button disabled={isLoading} onClick={generateTrip}>
          {isLoading ? (
            <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" /> // Show loading spinner while generating trip
          ) : (
            "Plan A Trip"
          )}
        </Button>
      </div>

      {/* Dialog for sign-in */}
      <Dialog
        className="m-4"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen} // Control dialog open state
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {user ? "Thank you for LogIn" : "Sign In to Continue"}
            </DialogTitle>
            <DialogDescription>
              <span className="flex gap-2">
                <span>
                  {user
                    ? "Logged In Securely to Travel Genius with Google Authentication"
                    : "Sign In to Travel Genius with Google Authentication Securely"}
                </span>
              </span>
              {user ? (
                ""
              ) : (
                <Button
                  onClick={SignIn} // Trigger sign-in process
                  className="w-full mt-5 flex gap-2 items-center justify-center"
                >
                  Sign In with <FcGoogle className="h-5 w-5" /> // Google Sign-In Button
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="w-full">
              <DialogClose>Close</DialogClose> {/* Close dialog */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
