import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";
import { Zoom, Card, CardContent, Button, IconButton } from "@material-ui/core";

export const PageChat = ({ arrChat, handleSend, handleClose }) => {
  let refInput = useRef();

  useEffect(() => { 
    refInput.current.focus();
  }, []);

  const send = () => {
    let text = refInput.current.value;
    handleSend(text);
    refInput.current.value = "";
  }

  return (
    <div className="first-container">
      <Zoom in={true} style={{ transitionDelay: "0ms" }}>
        <Card>
          <CardContent style={{ position: "relative" }}>
            <IconButton
              style={{ position: "absolute", top: 0, right: 0 }}
              onClick={handleClose}
            >
              <CancelIcon></CancelIcon>
            </IconButton>
            <div className="first-container">
              <div
                style={{
                  width: "400px",
                  maxWidth: "80%",
                  height: "500px",
                  maxHeight: "60%",
                  border: "8px double grey",
                  overflow:'auto'
                }}
              >
                {arrChat.map((chat, i) => (
                  <div key={i}>
                    <strong>{chat.sender}: </strong>
                    <span>{chat.plain}</span>
                  </div>
                ))}
              </div>

              <div style={{ width: "400px", maxWidth: "80%", display: "flex", marginTop:'30px' }}>
                <input style={{ flex: 1 }} ref={refInput} onKeyDown={(event) => { if (event.keyCode === 13) send();}}/>
                <IconButton type="submit" color="primary">
                  <SendIcon onClick={(event)=>send()}></SendIcon>
                </IconButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </Zoom>
    </div>
  );
};
