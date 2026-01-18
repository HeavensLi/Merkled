const API_BASE_URL = 'http://localhost:5000/api';

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getRecords = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const createRecord = async (token: string, fileName: string, fileHash: string, merkleRoot: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName, fileHash, merkleRoot }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create record');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyRecord = async (token: string, recordId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/records/${recordId}/verify`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify record');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteRecord = async (token: string, recordId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete record');
    }

    return { message: 'Record deleted successfully' };
  } catch (error) {
    throw error;
  }
};
