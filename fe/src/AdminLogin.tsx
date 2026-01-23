import { SignIn, useUser } from "@clerk/clerk-react";

export const EMAIL_CLIENT_CHECK = "bencemark.bernath@gmail.com";

const AdminLogin = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Checking auth</div>;

  if (!isSignedIn) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <SignIn />
      </div>
    );
  }

  const userEmail = user.primaryEmailAddress?.emailAddress;

  if (userEmail === EMAIL_CLIENT_CHECK) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>✅ Authenticated</h1>
        <p>
          Welcome back, Admin. You can now see the upload controls on the main
          page.
        </p>
      </div>
    );
  } else {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>⚠️ Access Restricted</h1>
        <p>You are signed in as {userEmail}.</p>
        <p>However, you are not the site owner. Nothing has changed for you.</p>
      </div>
    );
  }
};

export default AdminLogin;
