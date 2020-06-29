import React, { useState } from 'react'
import { Card, CardContent, Zoom, Button, IconButton } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import "../App.css";

export const PageJoin = ({ handleJoinConfirm, handleClose }) => {
  const [strCreate, setStrCreate] = useState("");

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
              <textarea
                className="dont-break-out"
                style={{ margin: "20px" }}
                cols="30"
                rows="15"
                placeholder="Paste in the invite code from your friend."
                onChange={(event) => {
                  setStrCreate(event.target.value);
                }}
              />

              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{ width: "200px", margin: "20px" }}
                onClick={(event) => handleJoinConfirm(strCreate)}
              >
                Join
              </Button>
            </div>
          </CardContent>
        </Card>
      </Zoom>
    </div>
  );
};
