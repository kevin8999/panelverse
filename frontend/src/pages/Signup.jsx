import React from "react";
import { useForm } from "react-hook-form";
import "../App.css";

function Signup() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
    
          if (!response.ok) {
            const error = await response.json();
            alert("Error: " + error.detail);
            return;
          }
          else {
            console.log("Successfully registered!");
          }
    
          const result = await response.json();
          alert(result.message);
        } catch (err) {
          console.error("Registration failed:", err);
        }
      };

    return (
        <>
            <h2>Registration Form</h2>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    {...register("name", { required: true })}
                    placeholder="Name"
                />
                {errors.name && <span style={{ color: "red" }}>*Name* is mandatory</span>}

                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="Email"
                />
                {errors.email && <span style={{ color: "red" }}>*Email* is mandatory</span>}

                <input
                    type="password"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />
                {errors.password && <span style={{ color: "red" }}>*Password* is mandatory</span>}

                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>
        </>
    );
}

export default Signup;