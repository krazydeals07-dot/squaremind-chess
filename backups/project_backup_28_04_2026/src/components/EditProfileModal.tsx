import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, TextField, Button, Avatar, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { updateUser, uploadProfileImage, getUserProfile } from '../utils/firebase/users'; // Corrected import

const EditProfileModal = ({ open, handleClose }) => {
    const { currentUser } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [newPhoto, setNewPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const [useCamera, setUseCamera] = useState(false);
    const [user, setUser] = useState(null);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            if (currentUser) {
                const userProfile = await getUserProfile(currentUser.uid);
                setUser(userProfile);
                setDisplayName(userProfile.displayName || '');
                setPhotoURL(userProfile.photoURL || '');
            }
        };

        if (open) {
            fetchUser();
            setError(null);
        } else if (!open) {
            stopCamera();
        }
    }, [user, open, currentUser]);

    const handleOpenCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setUseCamera(true);
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setError("Couldn't access camera. Please check permissions and try again.");
        }
    };

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                setNewPhoto(blob);
                setPhotoURL(URL.createObjectURL(blob));
            });
            stopCamera();
            setUseCamera(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setNewPhoto(file);
            setPhotoURL(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let newPhotoURL = photoURL;
            if (newPhoto) {
                newPhotoURL = await uploadProfileImage(currentUser.uid, newPhoto);
            }
            await updateUser(currentUser.uid, { displayName, photoURL: newPhotoURL }); // Corrected function call
            handleClose();
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ ...style, width: 400 }}>
                <Typography variant="h6" component="h2">Edit Profile</Typography>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                        <Avatar src={photoURL} sx={{ width: 80, height: 80, mr: 2 }} />
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="icon-button-file"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="icon-button-file">
                            <Button variant="contained" component="span">Upload</Button>
                        </label>
                        <IconButton onClick={handleOpenCamera} color="primary" aria-label="upload picture using camera">
                            <PhotoCamera />
                        </IconButton>
                    </Box>
                    {useCamera && (
                        <Box sx={{ my: 2 }}>
                            <video ref={videoRef} autoPlay style={{ width: '100%' }}></video>
                            <Button onClick={handleCapture} variant="contained">Capture</Button>
                        </Box>
                    )}
                    <TextField
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

EditProfileModal.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
};

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default EditProfileModal;
