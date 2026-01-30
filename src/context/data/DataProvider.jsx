import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import DataContext from './DataContext';
import api from '../../services/api';


export const DataProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents);
    } catch (err) {
      if (err.response?.status !== 403) {
        notifications.show({ title: 'Error', message: 'Failed to fetch documents', color: 'red' });
      }
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const createDocument = async (docData) => {
    try {
      await api.post('/documents', docData);
      notifications.show({ title: 'Success', message: 'Document created', color: 'green' });
      fetchDocuments();
      return true;
    } catch {
      notifications.show({ title: 'Error', message: 'Permission Denied', color: 'red' });
      return false;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      notifications.show({ title: 'Deleted', message: 'Document removed', color: 'blue' });
    } catch {
      notifications.show({ title: 'Error', message: 'Permission Denied', color: 'red' });
    }
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error("Fetch users failed", err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      notifications.show({ title: 'Simulation', message: 'User "deleted" (refresh to reset)', color: 'orange' });
    } catch {
      notifications.show({ title: 'Error', message: 'Permission Denied', color: 'red' });
    }
  };

  return (
    <DataContext.Provider
      value={{
        documents,
        users,
        documentsLoading,
        usersLoading,
        fetchDocuments,
        createDocument,
        deleteDocument,
        fetchUsers,
        deleteUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;