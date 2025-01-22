"use client"

import React, { useState, useRef, useEffect, useContext } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { movolabAuthToken } from '../store/UserContext';
import { UserContext } from '../store/UserContext';

const ChatWidget = () => {
  const { data: userData } = useContext(UserContext);

    const fullname = userData?.fullname || 'Nome Utente';
    const imageUrl = userData?.imageUrl || '/spiaggia-tramonto.png';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [audioFile, setAudioFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [messages, setMessages] = useState([]);
    const [vehicles, setVehicles] = useState([]);    
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  
    const messageContainerRef = useRef(null);
  
    const { startRecording, stopRecording, mediaBlobUrl} = useReactMediaRecorder({
      audio: true,
      onStop: (blobUrl, blob) => {
        setAudioFile(blob);
        setIsRecording(false);
      },
    });

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
      handleNewConversation();
    }, []);

    useEffect(() => {
      let timer;
      if (isRecording) {
        timer = setInterval(() => {
          setElapsedTime((prevTime) => prevTime + 1);
        }, 1000);
      } else {
        clearInterval(timer);
      }
    
      return () => clearInterval(timer);
    }, [isRecording]);
  
    const addMessage = (type, content, isLoading = false) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type,
          content,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isLoading,
        },
      ]);
    };    
  
    const handleTextSubmit = async (e) => {
      e.preventDefault();
    
      const trimmedMessage = message.trim(); 
    
      if (!trimmedMessage) return;
    
      addMessage("user", trimmedMessage);
      setMessage("");
    
      setIsLoading(true);
      addMessage("kommander", "", true);
    
      try {
        const response = await fetch("https://kommander-backend.onrender.com/new_message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_text: trimmedMessage, message_type: "text" }),
        });
    
        const result = await response.json();
        console.log("Risultato ricevuto:", result);
    
        const errorMessage = result.responseText || "Errore di interpretazione. Riprova.";
        const responseText =
          result.createdMessage?.parameters?.response?.responseText || errorMessage;
    
        const availableVehicles = result.availableVehicles?.result || [];
        const missingParameters = result.missingParameters || [];
    
        setVehicles(availableVehicles);
    
        let messageContent = "";
    
        if (availableVehicles.length === 0 && missingParameters.length === 0) {
          messageContent = `<p>Nessun veicolo disponibile del seguente tipo. Riprova!</p>`;
        } else {
          messageContent = responseText;
    
          if (availableVehicles.length > 0) {
            const vehiclesList = `
              <div class="vehicle-grid">
                ${availableVehicles
                  .map(
                    (vehicle, index) => `
                  <div class="vehicle-card flex items-center">
                    <div class="vehicle-index-div flex items-center justify-center">
                      <span class="vehicle-index font-bold">${index + 1}.</span>
                    </div>
                    <div class="vehicle-card-image">
                      <img src=${vehicle.version?.imageUrl} alt=${vehicle.id} />
                    </div>
                    <div class="vehicle-card-content">
                      <p class="plate"><strong>${vehicle.plate}</strong></p>
                      <div class="flex items-center justify-center">
                        <p class="brand-name">${vehicle.brand?.brandName}</p>
                        <p class="model-name">${vehicle.model?.modelName}</p>
                      </div>
                    </div>
                  </div>`
                  )
                  .join("")}
              </div>`;
            messageContent += `<br /> <p>Scegli uno dei seguenti veicoli: </p> <br />${vehiclesList}`;
          }
        }
    
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = messageContent;
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      } catch (error) {
        console.error(error);
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      } finally {
        setIsLoading(false);
      }
    };
    
  
    const handleAudioSubmit = async () => {
      if (!audioFile) return;
  
      addMessage("user", audioFile);
      setAudioFile(null);
  
      setIsLoading(true);
      addMessage("kommander", "", true);
  
      try {
        const formData = new FormData();
        formData.append("audio", audioFile, "audioMessage.wav");
  
        const response = await fetch("https://kommander-backend.onrender.com/upload-audio", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
        console.log("Risultato ricevuto:", result);
  
        const errorMessage = result.responseText || "Errore di interpretazione. Riprova.";
        const responseText = result.responseText || errorMessage;
  
        const availableVehicles = result.availableVehicles?.result || [];
        const missingParameters = result.missingParameters || [];
  
        setVehicles(availableVehicles);
  
        let messageContent = "";
    
        if (availableVehicles.length === 0 && missingParameters.length === 0) {
          messageContent = `<p>Nessun veicolo disponibile del seguente tipo. Riprova!</p>`;
        } else {
          messageContent = responseText;
    
          if (availableVehicles.length > 0) {
            const vehiclesList = `
              <div class="vehicle-grid">
                ${availableVehicles
                  .map(
                    (vehicle, index) => `
                  <div class="vehicle-card flex items-center">
                    <div class="vehicle-index-div flex items-center justify-center">
                      <span class="vehicle-index font-bold">${index + 1}.</span>
                    </div>
                    <div class="vehicle-card-image">
                      <img src=${vehicle.version?.imageUrl} alt=${vehicle.id} />
                    </div>
                    <div class="vehicle-card-content">
                      <p class="plate"><strong>${vehicle.plate}</strong></p>
                      <div class="flex items-center justify-center">
                        <p class="brand-name">${vehicle.brand?.brandName}</p>
                        <p class="model-name">${vehicle.model?.modelName}</p>
                      </div>
                    </div>
                  </div>`
                  )
                  .join("")}
              </div>`;
            messageContent += `<br /> <p>Scegli uno dei seguenti veicoli: </p> <br />${vehiclesList}`;
          }
        }
        
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = messageContent;
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      } catch (error) {
        console.error(error);
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleMicrophoneClick = () => {
      if (isRecording) {
        stopRecording();
        setIsRecording(false);
      } else {
        startRecording();
        setIsRecording(true);
        setElapsedTime(0);
        setIsRecordingAudio(true);
      }

    };
  
    useEffect(() => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }
    }, [messages]);
  
    const handleTextButtonClick = async (e) => {
      e.preventDefault();
      if (vehicles.length > 0) {
        chooseVehicleMessage(e);
        setMessage("");
      } else {
        handleTextSubmit(e);
      }
    };
    
    const handleAudioButtonClick = () => {
      if (vehicles.length > 0) {
        if (audioFile) {
          chooseVehicleAudio();
          setAudioFile(null);
          setIsRecordingAudio(false);
        }
      } else {
        handleAudioSubmit();
        setIsRecordingAudio(false);
      }
    };
  
    const chooseVehicleMessage = async (e) => {
      e.preventDefault();
      const trimmedMessage = message.trim(); 
    
      if (!trimmedMessage) return;
    
      addMessage("user", trimmedMessage);
      setMessage("");
    
      setIsLoading(true);
      addMessage("kommander", "", true);
    
      if (vehicles.length > 0) {
        try {
          const response = await fetch("https://kommander-backend.onrender.com/choose_vehicle_message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message_text: trimmedMessage, message_type: "text", availableVehicles: vehicles }),
          });
    
          const result = await response.json();
          const responseText = result.selectionVehicle.selectedVehicle.responseText || "Errore di interpretazione. Riprova.";
          const reservationId = result.reservation.updatedReservation._id;
    
          let messageContent = `${responseText}<br /><div class="mt-2"><a href="https://deploy-movolab-frontend-kommander.onrender.com/dashboard/prenotazioni/${reservationId}" rel="noopener noreferrer" class="inline-block px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded-md text-center hover:bg-blue-500 hover:text-white transition-colors">Vedi la tua prenotazione</a></div>`;
  
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const lastKommanderMessage = newMessages.find(
              (msg) => msg.type === "kommander" && msg.isLoading
            );
            if (lastKommanderMessage) {
              lastKommanderMessage.content = messageContent;
              lastKommanderMessage.isLoading = false;
            }
  
            return newMessages;
          });
        } catch (error) {
          console.error("Errore:", error);
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const lastKommanderMessage = newMessages.find(
              (msg) => msg.type === "kommander" && msg.isLoading
            );
            if (lastKommanderMessage) {
              lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
              lastKommanderMessage.isLoading = false;
            }
            return newMessages;
          });
        } finally {
          setIsLoading(false); 
        }
      } else {
        setIsLoading(false);
      }
    };
    
    const chooseVehicleAudio = async () => {
      if (!audioFile) return;
      addMessage("user", audioFile);
      setAudioFile(null);
    
      setIsLoading(true);
      addMessage("kommander", "", true);
    
      if (vehicles.length > 0) {
        try {
          const formData = new FormData();
          formData.append("audio", audioFile, "audioMessage.wav");
          formData.append("availableVehicles", JSON.stringify(vehicles));
    
          const response = await fetch("https://kommander-backend.onrender.com/choose_vehicle_audio", {
            method: "POST",
            body: formData,
          });
    
          const result = await response.json();
          console.log("Risultato:", result);
    
          const responseText = result.selectionVehicle.selectedVehicle.responseText || "Errore di interpretazione. Riprova.";
          const reservationId = result.reservation.updatedReservation._id;
  
          let messageContent = `${responseText}<br /><div class="mt-2"><a href="https://deploy-movolab-frontend-kommander.onrender.com/dashboard/prenotazioni/${reservationId}" rel="noopener noreferrer" class="inline-block px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded-md text-center hover:bg-blue-500 hover:text-white transition-colors">Vedi la tua prenotazione</a></div>`;
  
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const lastKommanderMessage = newMessages.find(
              (msg) => msg.type === "kommander" && msg.isLoading
            );
            if (lastKommanderMessage) {
              lastKommanderMessage.content = messageContent;
              lastKommanderMessage.isLoading = false;
            }
              
            return newMessages;
          });
        } catch (error) {
          console.error("Errore:", error);
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const lastKommanderMessage = newMessages.find(
              (msg) => msg.type === "kommander" && msg.isLoading
            );
            if (lastKommanderMessage) {
              lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
              lastKommanderMessage.isLoading = false;
            }
            return newMessages;
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    const resetState = () => {
      setIsModalOpen(false);
      setMessage("");
      setAudioFile(null);
      setIsLoading(false);
      setIsRecording(false);
      setMessages([]);
      setVehicles([]);
      setIsConfirmationOpen(false);
    };
  

    let authTokenMovolab = "";

    if (movolabAuthToken && movolabAuthToken.token) {
      authTokenMovolab = movolabAuthToken.token;
    } else {
      console.log("Token non aggiornato perché è una stringa vuota.");
    }
    
    const handleNewConversation = async () => { 
        resetState();
  
      
         try {
     
          const response = await fetch("https://kommander-backend.onrender.com/create_conversation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authTokenMovolab}`,
            }
        
          });
      
          const result = await response.json();
          console.log("Conversazione creata con successo:", result);

          const successMessage = `Ciao ${fullname}! Invia un messaggio e prenota il tuo veicolo.`;

          addMessage("kommander", successMessage);
      
        } catch (error) {
          console.error("Errore durante la creazione della conversazione:", error);
          }
        };
      
        const handleConfirmExit = () => {
         setIsConfirmationOpen(true);
        };
      
        const handleCloseConfirmation = () => {
          setIsConfirmationOpen(false);
        };
      
        const handleConfirmationNo = () => {
      
        setIsConfirmationOpen(false);
       };

       
      
      
    return (
      <div>
  
       {isConfirmationOpen && (
       <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 text-center bg-white shadow-lg">
          <span className="font-bold question-alert">Sei sicuro di voler chiudere questa conversazione?</span>
          <div className="flex space-x-2 div-buttons-alert">
          <button
          className="btn-alert btn-alert-no border-gray-100 py-2 px-4 text-sm bg-red-500"
          onClick={handleConfirmationNo}
          >
          No
          </button>
          <button
          className="btn-alert btn-alert-yes border-red-800 py-2 px-4 text-sm bg-green-500"
          onClick={handleNewConversation}
          >
          Sì
          </button>
          </div>
          </div>
       </div>
       )}
  
      <div
       className={`widget-custom rounded-lg shadow-lg bg-white ${
      isModalOpen ? "pointer-events-none opacity-50" : ""
      }`}
      >
          <div className="banner-custom-title flex items-center justify-between">
            <div className="flex items-center">
                <span className="font-bold">Prenota il tuo veicolo</span>
                <button
                    onClick={handleConfirmExit}
                    className="text-gray-600 ml-2 new-conversation-icon"
                  >
                  <i className="flex justify-center items-center fa-solid fa-pen-to-square"></i>
                </button>
              
            </div>
          </div>    
          <div
            className={`${audioFile ? "banner-custom-chat-audio" : "banner-custom-chat"}`}
            ref={messageContainerRef}
          >
          {messages.map((message, index) => (
              <div key={index} className={`w-full flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`banner-chat-${message.type} flex`}>
                  <img
                    className="logo-kommander-chat"
                    src={message.type === "user" ? imageUrl : "/Logo (1).png"}
                    alt={`${message.type}-icon`}
                  />
                  <div>
                    <div className="info-message-div">
                      <span className="font-bold type-user">
                        {message.type === "user" ? fullname : "Kommander.ai"}
                      </span>
                      <span className="hour-message">{message.time}</span>
                    </div>
                    {message.isLoading ? (
                      <div className="loader-container">
                        <img
                          src="/fade-stagger-circles.svg"
                          alt="loader"
                          className="w-6 h-6"
                        />
                      </div>
                    ) : (
                      <>
                        {message.type === "user" && message.content instanceof Blob ? (
                          <div className="w-full max-w-md mb-2 pt-2">
                            <audio controls src={URL.createObjectURL(message.content)} />
                          </div>
                        ) : (
                          <div className="message pt-1">
                            {typeof message.content === "string" ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: message.content,
                                }}
                              />
                            ) : (
                              message.content
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          <div className="banner-custom-footer flex w-full items-center justify-between">
          {!isRecordingAudio && !audioFile && (
            <div className="flex w-full items-center text-area-div rounded-md border border-gray-300">
                <div className="text-area-div-message h-full">
                  <textarea
                    className="text-area-custom outline-none resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    disabled={isRecording}
                  />
                </div>
                  <div className="flex items-end justify-end text-area-div-button h-full">
                    <button
                      className="btn-microphone ml-2 text-dark focus:outline-none"
                      onClick={handleMicrophoneClick}
                    >
                      <i className="fa-solid fa-microphone text-xl"></i>
                    </button>
                    <button
                    className="btn-send py-2 px-4 text-sm"
                    onClick={(e) => {
                      if (message.trim()) {
                        handleTextButtonClick(e);
                      } else if (audioFile) {
                        handleAudioButtonClick();
                      }
                    }}
                    disabled={isRecording || (!message.trim() && !audioFile)}
                    >
                    <span>{message.trim() ? "Invia" : "Invia"}</span>
                    </button>
                  </div>
                </div>
              )}

              {isRecordingAudio && !audioFile && (
                <div className="flex w-full justify-center items-center h-full text-area-div rounded-md border border-gray-300">

                    <span className="font-bold time-recording">{formatTime(elapsedTime)}</span>
                 
                    <button
                      className="btn-microphone-close ml-2 text-dark focus:outline-none"
                      onClick={handleMicrophoneClick}
                    >
                      <i className="fa-regular fa-circle-stop"></i>
                  </button>

                </div>
              )}


              {isRecordingAudio && audioFile && (
              <div className="flex w-full items-center text-area-div rounded-md border border-gray-300">
                <audio controls src={mediaBlobUrl} className="audio-panel" />
                <button
                  className="trash-audio"
                  onClick={() => {
                    setAudioFile(null);
                    setIsRecordingAudio(false);
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
                <button
                  className="btn-send py-2 px-4 text-sm"
                  onClick={(e) => {
                    if (message.trim()) {
                      handleTextButtonClick(e);
                    } else if (audioFile) {
                      handleAudioButtonClick();
                    }
                  }}
                  disabled={isRecording || (!message.trim() && !audioFile)}
                >
                  <span>{message.trim() ? "Invia" : "Invia"}</span>
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
