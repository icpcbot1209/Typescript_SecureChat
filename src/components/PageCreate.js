import React from 'react'
import { Zoom, Card, CardContent, Button, IconButton } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import "../App.css";

export const PageCreate = ({ strCreate, handleCopy, handleClose }) => {
  return (
    <div className="first-container">
      <Zoom in={true} style={{ transitionDelay: "0ms" }}>
        <Card>
          <CardContent style={{position:'relative'}}>
            <IconButton style={{ position: 'absolute', top: 0, right: 0 }}
              onClick={handleClose}>
              <CancelIcon></CancelIcon>
            </IconButton>
            <div className="first-container">
              <div
                className="dont-break-out"
                style={{
                  width: "300px",
                  margin: "20px",
                  border: "8px double grey",
                }}
              >
                {strCreate}
              </div>

              <strong>Please wait until your friend comes in.</strong>
              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{ width: "200px", margin: "20px" }}
                onClick={(event) => handleCopy(strCreate)}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </Zoom>
    </div>
  );
};
