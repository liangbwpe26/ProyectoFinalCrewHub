import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { fetchAPI } from '../services/api.js';

export const useOnboarding = () => {
    const { activeUser, setActiveUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [availableInterests, setAvailableInterests] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchInterests = async () => {
            try {
                const data = await fetchAPI('/interests');
                if (data.success) {
                    setAvailableInterests(data.interests);
                }
            } catch (error) {
                console.error("Error cargando intereses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInterests();
    }, []);

    const toggleInterest = (slug) => {
        if (selectedInterests.includes(slug)) {
            setSelectedInterests(selectedInterests.filter(item => item !== slug));
        } else {
            setSelectedInterests([...selectedInterests, slug]);
        }
    };

    const handleSaveInterests = async () => {
        if (selectedInterests.length < 3) return; 
        
        setSaving(true);
        try {
            const data = await fetchAPI('/user/interests', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ interests: selectedInterests })
            });

            if (data.success) {
                setActiveUser(data.user);
                navigate('/');
            }
        } catch (error) {
            console.error("Error guardando intereses:", error);
            setSaving(false);
        }
    };

    return {
        availableInterests,
        selectedInterests,
        loading,
        saving,
        toggleInterest,
        handleSaveInterests
    };
};