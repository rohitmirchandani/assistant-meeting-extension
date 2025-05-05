import { Orgs } from './components/Orgs/Orgs'
import './App.css'
import { getFromStorage, setInStorage, STORAGE, CONSTANTS } from '../public/utility';
import { useEffect, useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';

function App() {
  const [isToken, setIsToken] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  async function getToken(){
    const token = await getFromStorage(STORAGE.token);
    if (!token) {
      //@ts-ignore
      const response = await chrome.runtime.sendMessage({ type: 'get-token' });
      if (response.token) {
        await setInStorage(STORAGE.token, response.token);
        setIsToken(true);
      }else{
        if('token' in response){
          setIsToken(false);
        }else{
          console.error(response, 'here is the responsesese')
          setError(new Error('Unable to fetch token from ' + CONSTANTS.domain));
        }
      }
    } else {
      setIsToken(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    getToken().catch((err) => {
      console.error('Some errror', err);
    });
  }, []);

  return (
    <Box 
      sx={{ 
        padding: '1rem', 
        backgroundColor: '#121212', 
        color: '#fff', 
        fontFamily: 'Inter, sans-serif' 
      }}
    >
      <Typography variant="h5" fontWeight={600} gutterBottom>
        👋 Welcome to 50Agents
      </Typography>
      {error ? (
        <Typography variant="body1" gutterBottom sx={{ color: 'red' }}>
          {error.message}
        </Typography>
      ) : loading ? (
        <CircularProgress color="inherit" />
      ) : isToken ? (
        <Orgs />
      ) : (
        <Button 
          variant="contained" 
          color="primary" 
          href="https://chat.50agents.com/login" 
          target="_blank"
          sx={{ mt: 1, borderRadius: '8px', textTransform: 'none', '&:hover': { color: '#eee' } }}
        >
          Login to Continue
        </Button>
      )}
    </Box>
  );  
}

export default App;
