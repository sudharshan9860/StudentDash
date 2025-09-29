import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { soundManager, SOUND_TYPES } from '../utils/SoundManager';

const SoundConfigModal = ({ show, onHide }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isSoundEnabled);
  const [volume, setVolume] = useState(soundManager.volume);

  const handleToggleSound = () => {
    soundManager.toggleSound();
    setIsSoundEnabled(!isSoundEnabled);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const playTestSound = (soundType) => {
    soundManager.play(soundType);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sound Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="sound-toggle"
              label="Enable Sounds"
              checked={isSoundEnabled}
              onChange={handleToggleSound}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Volume</Form.Label>
            <Form.Range 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume}
              onChange={handleVolumeChange}
              disabled={!isSoundEnabled}
            />
          </Form.Group>

          <div className="sound-test-buttons">
            <h6>Test Sounds</h6>
            <div className="d-flex flex-wrap gap-2">
              {Object.values(SOUND_TYPES).map((soundType) => (
                <Button 
                  key={soundType}
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => playTestSound(soundType)}
                  disabled={!isSoundEnabled}
                >
                  {soundType.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SoundConfigModal;