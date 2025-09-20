import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import Turnstile, { useTurnstile } from "react-turnstile";
import config from "../config";

const FeePaymentPage = () => {
  const turnstile = useTurnstile();
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [isFilling, setIsFilling] = useState(false);
  const tokenRef = useRef("");
  const [paymentKey, setPaymentKey] = useState("");


  const [form, setForm] = useState({
    mobile: "",
    firstName: "",
    lastName: "",
    email: "",
    course: "",
    program: "",
    amount: "",
  });

  const validate = (fieldValues = form) => {
    let temp = { ...errors };

    if ("mobile" in fieldValues) {
      if (!fieldValues.mobile) temp.mobile = "Mobile number is required";
      else if (!/^\d{10}$/.test(fieldValues.mobile))
        temp.mobile = "Enter a valid 10-digit mobile number";
      else temp.mobile = "";
    }

    if ("firstName" in fieldValues) {
      temp.firstName = fieldValues.firstName ? "" : "First name is required";
    }

    if ("lastName" in fieldValues) {
      temp.lastName = fieldValues.lastName ? "" : "Last name is required";
    }

    if ("email" in fieldValues) {
      if (!fieldValues.email) temp.email = "Email is required";
      else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(fieldValues.email)
      )
        temp.email = "Enter a valid email";
      else temp.email = "";
    }

    if ("course" in fieldValues) {
      temp.course = fieldValues.course ? "" : "Course is required";
    }

    if ("program" in fieldValues) {
      temp.program = fieldValues.program ? "" : "Program is required";
    }

    if ("amount" in fieldValues) {
      if (!fieldValues.amount) temp.amount = "Amount is required";
      else if (isNaN(fieldValues.amount) || Number(fieldValues.amount) <= 0)
        temp.amount = "Enter a valid amount";
      else if (fieldValues.amount < 2000)
        temp.amount = "Minimum amount must be 2000"
      else temp.amount = "";
    }

    setErrors({ ...temp });

    return Object.values(temp).every((x) => x === "");
  };

  const autoFillForm = async (token, mobile) => {
    try {
      const resp = await fetch(`${config.hostUrl}/api/verify_student?mobile=${mobile}&token=${token}`);
      const data = await resp.json();

      if (resp.status === 200) {
        setForm((prev) => ({ ...prev, program: data.program, firstName: data.firstName, lastName: data.lastName, email: data.email, course: data.courseId }));
        setPaymentKey(data.paymentKey)
      } else {
        console.log("no student details found for this mobile number!");
      }
    } catch (Err) {

    } finally {
      setIsFilling(false);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "mobile") {
      if (e.target.value.length === 10) {
        e.target.blur();
      }
    }
  };

  const loadRazorpay = () => {
    if (!validate()) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = () => alert("Razorpay SDK failed to load.");
    script.onload = () => handlePayment();
    document.body.appendChild(script);
  };

  const handlePayment = async (e) => {
    if (!form.firstName || !form.email || !form.mobile || !form.amount) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const { data: order } = await axios.post(
        `${config.hostUrl}/api/payment/create-order`,
        {
          amount: form.amount,
          currency: "INR",
          receipt: `receipt_${Math.floor(Math.random() * 10000)}`,
        }
      );

      const options = {
        key: paymentKey,
        amount: order.amount,
        currency: order.currency,
        name: "Boston Institute of Analytics",
        description: "Student Fee Payment",
        order_id: order.id,
        handler: function (response) {
          alert("Payment Successful!");
          console.log("Razorpay response:", response);
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.mobile,
        },
        notes: {
          purpose: "Student Fees",
          firstName: form.firstName,
          lastName: form.lastName,
          course: form.course,
          program: form.program,
          mobile: form.mobile,
          email: form.email,
        },
        theme: {
          color: "#1d2447",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Failed to start payment.");
      console.error(error);
    }
  };

  const programOptions = [
    { value: "certification", label: "Certification" },
    { value: "diploma", label: "Diploma" },
    { value: "master diploma", label: "Master Diploma" },
  ];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#3399cc" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #d1d5db" : "none",
      "&:hover": {
        borderColor: "#2563eb",
      },
      borderRadius: "8px",
      minHeight: "35px",
      backgroundColor: "white",
      color: "#000",
      fontSize: '0.75rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#E5E7EB" : "white",
      color: "#000",
      cursor: "pointer",
      fontSize: '0.75rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#000",
      fontSize: '0.75rem',
    }),
    input: (provided) => ({
      ...provided,
      color: "#000",
      fontSize: '0.75rem',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: "white",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const fetchCourses = async () => {
    try {
      const resp = await fetch(`${config.hostUrl}/api/get_courses`);
      const data = await resp.json();
      return data;
    } catch (err) {
      return [];
    }
  };
  useEffect(() => {
    if (form.mobile.length !== 10) return;

    setIsFilling(true);
    const oldToken = tokenRef.current;
    turnstile.reset();
    const poll = setInterval(() => {
      if (tokenRef.current !== oldToken && tokenRef.current !== '') {
        autoFillForm(tokenRef.current, form.mobile);
        clearInterval(poll);
      }
    }, 500);

    return () => clearInterval(poll);
  }, [form.mobile]);


  useEffect(() => {
    const getCourses = async () => {
      const data = await fetchCourses();

      if (data && Array.isArray(data)) {
        setCourses(data);
      } else {
        console.error("Invalid data format:", data);
      }
    };

    getCourses();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10">
          <div
            className="w-full md:w-[500px] bg-white px-5 py-4 rounded-lg shadow-md"
            style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
          >
            <div className="bg-white px-5 py-2 mt-5 rounded-lg relative">
              {isFilling && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                    <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Fetching details. Please wait ...
                  </div>
                </div>
              )}

              <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-5">
                  <h2 className="text-base/7 font-semibold text-gray-900">
                    Fees Payment
                  </h2>
                  <p className="mt-1 text-gray-600 text-xs">
                    Kindly enter your mobile number first. If it is already
                    registered, the remaining details will be fetched
                    automatically.
                  </p>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="mobile"
                      className="block text-xs/6 font-medium text-gray-900"
                    >
                      Mobile
                    </label>
                    <div className="mt-1">
                      <input
                        placeholder="Enter Mobile"
                        id="mobile"
                        type="mobile"
                        autoComplete="mobile"
                        className="block w-full rounded-md bg-white px-3 text-xs py-1.5 text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-xs/6"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        maxLength={10}
                        onFocus={(e) =>
                          setErrors({ ...errors, [e.target.name]: null })
                        }
                      />

                      {errors.mobile && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.mobile}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="first-name"
                        className="block text-xs/6 font-medium text-gray-900"
                      >
                        First name
                      </label>
                      <div className="mt-1">
                        <input
                          placeholder="Enter First Name"
                          type="text"
                          name="firstName"
                          id="first-name"
                          autoComplete="given-name"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-xs text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-xs/6"
                          value={form.firstName}
                          onChange={handleChange}
                          onFocus={(e) =>
                            setErrors({ ...errors, [e.target.name]: null })
                          }
                        />
                        {errors.firstName && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="last-name"
                        className="block text-xs/6 font-medium text-gray-900"
                      >
                        Last name
                      </label>
                      <div className="mt-1">
                        <input
                          placeholder="Enter Last Name"
                          type="text"
                          name="lastName"
                          id="last-name"
                          autoComplete="family-name"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-xs text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-xs/6"
                          value={form.lastName}
                          onChange={handleChange}
                          onFocus={(e) =>
                            setErrors({ ...errors, [e.target.name]: null })
                          }
                        />
                        {errors.lastName && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.lastName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label
                        htmlFor="email"
                        className="block text-xs/6 font-medium text-gray-900"
                      >
                        Email ID
                      </label>
                      <div className="mt-1">
                        <input
                          placeholder="Enter Email"
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-xs text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-xs/6"
                          value={form.email}
                          onChange={handleChange}
                          onFocus={(e) =>
                            setErrors({ ...errors, [e.target.name]: null })
                          }
                        />
                        {errors.email && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="course-label"
                        className="block text-xs/6 font-medium text-gray-900"
                      >
                        Course
                      </label>
                      <Select
                        name="course"
                        options={courses.map((c) => ({
                          label: c.name,
                          value: c._id,
                        }))}
                        styles={customStyles}
                        value={courses
                          .map((c) => ({
                            label: c.name,
                            value: c._id,
                          }))
                          .find((option) => option.value === form.course)}
                        onChange={(selectedOption) => {
                          setForm((prev) => ({
                            ...prev,
                            course: selectedOption.value,
                          }))
                          setErrors({ ...errors, course: null })
                        }
                        }
                      />
                      {errors.course && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.course}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="program-label"
                        className="block text-xs/6 font-medium text-gray-900"
                      >
                        Program
                      </label>
                      <Select
                        name="program"
                        options={programOptions}
                        styles={customStyles}
                        value={programOptions.find(
                          (option) => option.value === form.program
                        )}
                        onChange={(selectedOption) => {
                          setForm((prev) => ({
                            ...prev,
                            program: selectedOption.value,
                          }))
                          setErrors({ ...errors, program: null })
                        }
                        }
                      />
                      {errors.program && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.program}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-4 mt-2">
                    <label
                      htmlFor="amount"
                      className="block text-xs/6 font-medium text-gray-900"
                    >
                      Amount
                    </label>
                    <div className="mt-2">
                      <input
                        placeholder="Enter Amount"
                        onWheel={(e) => e.target.blur()}
                        id="amount"
                        name="amount"
                        type="number"
                        autoComplete="off"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-xs text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-xs/6"
                        value={form.amount}
                        onChange={handleChange}
                        onFocus={(e) =>
                          setErrors({ ...errors, [e.target.name]: null })
                        }
                      />
                      {errors.amount && (
                        <div className="text-red-500 text-xs mt-1">{errors.amount}</div>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600 text-xs text-bold">
                    By clicking, you are confirming that you have read,
                    understood and agreed to BIA® Terms and Conditions.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-x-6">
                <button
                  className="text-white bg-indigo-500 border-0 py-1 px-12 focus:outline-none hover:bg-indigo-600 rounded text-md"
                  onClick={loadRazorpay}
                >
                  Continue Payment
                </button>
              </div>
            </div>

            <Turnstile
              sitekey="0x4AAAAAABlmxQvnH19s_vuZ"
              onVerify={(token) => {
                tokenRef.current = token;
              }}
            />
          </div>

          <div className="hidden md:block self-end">
            <img
              src="https://bia.bostoninstituteofanalytics.org/img/graduate-girl.png"
              alt="Payment Visual"
              className="max-w-[300px] rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white pt-4 sm:pt-10 lg:pt-12">
        <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="mb-16 grid grid-cols-2 gap-12 border-t pt-10 md:grid-cols-4 lg:grid-cols-6 lg:gap-8 lg:pt-12">
            <div className="col-span-full lg:col-span-2">
              <div className="mb-4 lg:-mt-2">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-xl font-bold text-black md:text-2xl"
                  aria-label="logo"
                >
                  <svg
                    width="95"
                    height="94"
                    viewBox="0 0 95 94"
                    className="h-auto w-5 text-indigo-500"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M96 0V47L48 94H0V47L48 0H96Z" />
                  </svg>
                  Boston Institute Of Analytics
                </a>
              </div>

              <p className="mb-6 text-gray-500 sm:pr-8">
                Filler text is dummy text which has no meaning however looks
                very similar to real text.
              </p>

              <div className="flex gap-4">
                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <div className="mb-4 font-bold uppercase tracking-widest text-gray-800">
                Products
              </div>

              <nav className="flex flex-col gap-4">
                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Overview
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Solutions
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Pricing
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Customers
                  </a>
                </div>
              </nav>
            </div>
            <div>
              <div className="mb-4 font-bold uppercase tracking-widest text-gray-800">
                Company
              </div>

              <nav className="flex flex-col gap-4">
                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    About
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Investor Relations
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Jobs
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Press
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Blog
                  </a>
                </div>
              </nav>
            </div>
            <div>
              <div className="mb-4 font-bold uppercase tracking-widest text-gray-800">
                Support
              </div>

              <nav className="flex flex-col gap-4">
                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Contact
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Documentation
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Chat
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    FAQ
                  </a>
                </div>
              </nav>
            </div>

            <div>
              <div className="mb-4 font-bold uppercase tracking-widest text-gray-800">
                Legal
              </div>

              <nav className="flex flex-col gap-4">
                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Terms of Service
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Privacy Policy
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Cookie settings
                  </a>
                </div>
              </nav>
            </div>
          </div>

          <div className="border-t py-8 text-center text-sm text-gray-400">
            © 2025 - Boston Institute of analytics. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default FeePaymentPage;
