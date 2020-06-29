import React from 'react'
import { Container, Zoom, Button } from "@material-ui/core";
import "../App.css";

export const First = ({ handleCreate, handleJoin }) => {

  return (
    <div className="first-container">
      <Zoom in={true} style={{ transitionDelay: '0ms' }}>
        <h1>SECURE CHAT</h1>
      </Zoom>
      <Zoom in={true} style={{ transitionDelay: '150ms' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          style={{ width: "200px", margin: "20px" }}
          onClick={handleCreate}
        >
          create
        </Button>
      </Zoom>
      <Zoom in={true} style={{ transitionDelay: '300ms' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          style={{ width: "200px", margin: "20px" }}
          onClick={handleJoin}
        >
          join
        </Button>
      </Zoom>

    </div>
  );
}
