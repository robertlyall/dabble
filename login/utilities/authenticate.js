export default function authenticate(email, password) {
  console.log(email, password);
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      console.log(email, "rob@atech.media", email === "rob@atech.media");
      console.log(password, "hunter2", password === "hunter2");
      if (email === "rob@atech.media" && password === "hunter2") {
        return resolve({
          token: "abc123",
          user: {
            email: "rob@atech.media",
            id: "Robert"
          }
        });
      }

      reject();
    }, 1000);
  });
}
