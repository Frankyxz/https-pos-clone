import React, { useState, useEffect, useRef } from "react";
import "../styles/login.css";
// import "../styles/pos_react.css";
import posImg from "../../assets/image/posImg.jpg";
import swal from "sweetalert";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../assets/global/url";
import { Button, Modal } from "react-bootstrap";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { jwtDecode } from "jwt-decode";
import ReactLoading from "react-loading";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePhoto, setStorePhoto] = useState("");
  const [error, setError] = useState(false); // Show the error message below password input
  const navigate = useNavigate();
  const [sendCodeEmail, setSendCodeEmail] = useState(false);

  //For Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);

  //For input field of New password creation
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //for 15 mins timer for sign in error
  // const [errorCount, setErrorCount] = useState(0);

  // Show the Code Modal when the email is entered by the user
  const [OtpSent, setOtpSent] = useState("");
  const [OtpInput, setOtpInput] = useState("");
  const generateRandomNumber = () => {
    // Math.random() generates a number between 0 and 1.
    // Multiplying by 900000 gives a range of 0 to 899999.
    // Adding 100000 ensures that the smallest number generated is 100000.
    return Math.floor(100000 + Math.random() * 900000);
  };
  const handleForgotPassword = () => {
    swal({
      title: `Email Verification`,
      text: "is your email correct?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (approve) => {
      if (approve) {
        setSendCodeEmail(true);
        axios
          .post(BASE_URL + "/masterList/checkEmail", { username })
          .then((response) => {
            if (response.status === 200) {
              const code = generateRandomNumber();
              setOtpSent(code);
              axios
                .post(BASE_URL + "/masterList/sentOtp", {
                  code,
                  toSendEmail: username,
                })
                .then((response) => {
                  if (response.status === 200) {
                    setShowCodeModal(true);
                    setShowForgotModal(false);
                    setSendCodeEmail(false);
                  } else {
                    swal({
                      title: "Something Went Wrong",
                      text: "Please contact our support team",
                      icon: "error",
                    });
                  }
                })
                .catch((error) => {
                  swal({
                    title: "Something Went Wrong",
                    text: "Please contact our support team",
                    icon: "error",
                  }).then(() => {
                    window.location.reload();
                  });
                });
            } else if (response.status === 202) {
              swal({
                title: "Oppss!",
                text: "Email not exist",
                icon: "error",
              });
            }
          })
          .catch((error) => {
            swal({
              title: "Something Went Wrong",
              text: "Please contact our support team",
              icon: "error",
            }).then(() => {
              window.location.reload();
            });
          });
      }
    });
  };

  // Show creation of password modal after the user enter the correct code
  const handleEnterCode = () => {
    if (parseInt(OtpSent) === parseInt(OtpInput)) {
      // console.log(`OtpSents`);
      // console.log(OtpSent);
      setShowCodeModal(false);
      setShowNewPasswordModal(true);
    } else {
      // console.log(`OtpSent`);
      // console.log(OtpSent);
      swal({
        title: "Invalid OTP",
        text: "Please recheck your OTP sent to your email",
        icon: "error",
      });
    }
  };

  const handleConfirmPassword = () => {
    if (newPassword === "" || confirmNewPassword === "") {
      swal({
        text: "Password is required",
        icon: "error",
        button: "OK",
      });
    } else if (newPassword === confirmNewPassword) {
      axios
        .post(BASE_URL + "/masterList/setNewPass", { newPassword, username })
        .then((response) => {
          if (response.status === 200) {
            swal({
              text: "Your changes has been successfully saved!",
              icon: "success",
              button: "OK",
            }).then(() => {
              setShowNewPasswordModal(false);
            });
          } else {
            swal({
              title: "Something Went Wrong",
              text: "Please contact our support team",
              icon: "error",
            });
          }
        })
        .catch((error) => {
          // console.error(error.response.data);
          swal({
            title: "Something Went Wrong",
            text: "Please contact our support team",
            icon: "error",
          }).then(() => {
            window.location.reload();
          });
        });
    } else {
      swal({
        title: "Oppss!",
        text: "Password not matched",
        icon: "error",
      });
    }
  };

  const [remainingTime, setRemainingTime] = useState(120); // 2 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000); // Update every 1 second
      return () => clearTimeout(timer);
    } else {
      // button will disabled

      setIsResendDisabled(false); // enable button
    }
  }, [remainingTime]);

  const handleResendCode = async () => {
    try {
      const code = generateRandomNumber();
      setSendCodeEmail(true);
      axios
        .post(BASE_URL + "/masterList/sentOtp", {
          code,
          toSendEmail: username,
        })
        .then((res) => {
          if (res.status === 200) {
            swal({
              title: "OTP Sent Successfully!",
              text: "Please check your email",
              icon: "success",
              button: "OK",
            }).then(() => {
              setIsResendDisabled(true); //disabled button
              setRemainingTime(120);
              setSendCodeEmail(false);
              setOtpSent(code); //pass to outside
            });
          } else {
            swal({
              title: "Something Went Wrong",
              text: "Please contact our suppport team",
              icon: "error",
              button: "OK",
            });
          }
        });
    } catch (error) {
      console.error("Email sending failed", error);
      swal({
        title: "Something Went Wrong",
        text: "Please contact our suppport team",
        icon: "error",
        button: "OK",
      });
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Token:", accessToken);
    try {
      if (accessToken) {
        navigate("/menu");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    axios
      .post(BASE_URL + "/masterList/login", { username, password })
      .then((response) => {
        if (response.status === 200) {
          // console.log(response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          navigate("/menu");
        } else if (response.status === 201) {
          // console.log(response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          navigate("/kiosk-main");
        } else if (response.status === 202) {
          // setErrorCount(errorCount + 1);
          setError("The username or password you entered is incorrect");
        } else if (response.status === 203) {
          setError("Your account is inactive");
        } else if (response.status === 204) {
          setError("User not found");
        }
      })
      .catch((error) => {
        console.error(error.response.data);
        swal({
          title: "Something Went Wrong",
          text: "Please contact our support team",
          icon: "error",
        }).then(() => {
          window.location.reload();
        });
      });
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreName(res.data.store_name || "ELI");
    setStorePhoto(res.data.image);
  };

  useEffect(() => {
    handleFetchProfile();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // useEffect(() => {
  //   if (errorCount === 3) {
  //     setErrorCount(0);
  //     document.getElementById("loginSubmit").disabled = true;
  //     setTimeout(function () {
  //       document.getElementById("loginSubmit").disabled = false;
  //     }, 900000);
  //   }
  // }, [errorCount]);

  //auto insert super admin
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      const createRbac = async () => {
        try {
          const response = await axios.post(`${BASE_URL}/userRole/rbacautoadd`);
          if (response && response.status === 200) {
            console.error("Superadmin role already exists");
          } else if (response && response.status === 401) {
            console.error("Superadmin user not found");
          } else {
            console.error("Error creating rbac:", response);
          }
        } catch (error) {
          console.error("Error creating rbac:", error);
        }
      };
      createRbac();
    }
  }, []);

  return (
    <>
      <div className="login-container ">
        <div className="details-container">
          <div className="details">
            <h1 className="eli-title blue">{storeName || "ELI"}</h1>
            <h1 className="title">
              <span className="blue">POINT</span>
              <span className="of">OF</span>
              <span className="sale">SALE</span>
            </h1>

            <div className="welcome-container">
              <h4>Welcome &#x1F44B;</h4>
              <p>Today is a new day. It's your day. You shape it.</p>
              <p>Sign in to start managing your projects.</p>
            </div>
            <div className="input-container">
              <form onSubmit={handleLogin}>
                <div className="email-container">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="input"
                    name="username"
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={50} // Set the character limit to 50 characters
                    required
                  />
                </div>
                <div className="pass-container">
                  <label htmlFor="email">Password</label>
                  <div className="pass-input p-0 d-flex flex-row">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input"
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={50} // Set the character limit to 50 characters
                      required
                    />
                    <span className="eye-icon">
                      {showPassword ? (
                        <EyeSlash
                          size={24}
                          color="#1a1a1a"
                          weight="light"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <Eye
                          size={24}
                          color="#1a1a1a"
                          weight="light"
                          onClick={togglePasswordVisibility}
                        />
                      )}
                    </span>
                  </div>
                </div>
                {error && <div className="error fs-5">{error}</div>}
                <button type="submit" className="btn-sign" id="loginSubmit">
                  Sign in
                </button>

                <p className="forgot" onClick={() => setShowForgotModal(true)}>
                  Forgot Password?
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="login-img-container h-100">
          <img
            src={!storePhoto ? posImg : `data:image/png;base64,${storePhoto}`}
            alt={storePhoto ? "storephoto" : "POS"}
            className={storePhoto ? "" : "img-pos"}
          />
        </div>
      </div>

      {/* Modals For Forgot Password */}
      <Modal
        show={showForgotModal}
        onHide={() => setShowForgotModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>Forgot Password</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="body-modal">
            <p className="modal-p">
              Please Enter your email to verify your account.
            </p>
            <div className="modal-input-container">
              <p>Enter your Email Address:</p>
              <div class="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="email@gmail.com"
                  onChange={(e) => setUsername(e.target.value)}
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                />
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer style={{ border: "none" }}>
          <>
            {!sendCodeEmail ? (
              <>
                <Button
                  variant="outline-primary"
                  className="modal-btn"
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="modal-btn"
                  type="button"
                  onClick={handleForgotPassword}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-50 justify-content-end">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"18%"}
                    width={"18%"}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    Sending Code...
                  </span>
                </div>
              </>
            )}
          </>
        </Modal.Footer>
      </Modal>
      {/* Modal for Entering Code */}
      <Modal
        show={showCodeModal}
        onHide={() => setShowCodeModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>We'll send you a code to your email</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="body-modal">
            <p className="modal-p">
              Please check your email for a message with your code.
            </p>
            <div className="modal-input-container">
              <p>Enter Code:</p>
              <div class="input-group mb-3">
                <input
                  type="number"
                  className="form-control"
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="000000"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                />
              </div>

              {isResendDisabled && (
                <div className="time-remaining">
                  Time Remaining: {remainingTime}
                </div>
              )}

              <>
                {!sendCodeEmail ? (
                  <div className="time-remaining">
                    <button
                      className="btn btn-secondary"
                      onClick={handleResendCode}
                      disabled={isResendDisabled}
                    >
                      Resend
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="d-flex w-50 justify-content-end">
                      <ReactLoading
                        color="blue"
                        type={"spinningBubbles"}
                        height={"18%"}
                        width={"18%"}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          marginTop: "10px",
                          marginLeft: "5px",
                        }}
                      >
                        Sending Code...
                      </span>
                    </div>
                  </>
                )}
              </>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button
            variant="outline-primary"
            className="modal-btn"
            type="button"
            onClick={() => {
              setShowCodeModal(false);
              setIsResendDisabled(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="modal-btn"
            type="button"
            onClick={handleEnterCode}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Creating New Password */}
      <Modal
        show={showNewPasswordModal}
        onHide={() => setShowNewPasswordModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>Create a New Password</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="body-modal">
            <p className="modal-p">
              Type and confirm a secure new password for your account.
            </p>
            <div className="modal-input-container">
              <p>New Password:</p>
              <div class="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="*****"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-input-container">
              <p>Confirm New Password:</p>
              <div class="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="*****"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>
            {confirmNewPassword.length >= 1 ? (
              <div className="match-status">
                {newPassword === confirmNewPassword ? (
                  <span style={{ color: "green" }}> Password match.</span>
                ) : (
                  <span style={{ color: "red" }}> Password do not match.</span>
                )}
              </div>
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            className="modal-btn"
            type="button"
            onClick={() => setShowNewPasswordModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="modal-btn"
            type="button"
            onClick={handleConfirmPassword}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default Login;
