import { getFunctions, httpsCallable } from "firebase/functions";

// IMPORTANT: This is a one-time script to set the initial admin user.
// After running it successfully, you should remove this file or the call to it.

const setInitialAdmin = async (email: string) => {
  console.log(`Requesting to make ${email} an admin...`);

  const functions = getFunctions();
  const addAdminRole = httpsCallable(functions, 'addAdminRole');

  try {
    const result = await addAdminRole({ email });
    console.log(result.data.message);
    alert("Successfully made the user an admin! You can now log in to the admin panel.");
  } catch (error) {
    console.error("Error calling addAdminRole function:", error);
    alert(`Error: ${error.message}. Check the console for more details.`);
  }
};

export { setInitialAdmin };
