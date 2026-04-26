import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import { useNavigate } from 'react-router-dom';
import './GestionUsuarios.css';

export default function GestionUsuarios() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rol: 'Oficial',
        dniOficial: ''
    });
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (user?.rol !== 'Admin') {
            navigate('/');
            return;
        }
        cargarUsuarios();
    }, [user, navigate]);

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/api/users');
            if (response.success) {
                setUsuarios(response.data);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/users', formData);
            if (response.success) {
                alert('Usuario creado exitosamente');
                setShowModal(false);
                setFormData({ username: '', password: '', rol: 'Oficial', dniOficial: '' });
                cargarUsuarios();
            }
        } catch (error) {
            alert(error.message || 'Error al crear usuario');
        }
    };

    const handleToggle = async (id) => {
        if (!confirm('¿Cambiar estado del usuario?')) return;
        try {
            const response = await api.put(`/api/users/${id}/toggle`);
            if (response.success) {
                cargarUsuarios();
            }
        } catch (error) {
            alert(error.message || 'Error al cambiar estado');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿ELIMINAR este usuario permanentemente?')) return;
        try {
            const response = await api.delete(`/api/users/${id}`);
            if (response.success) {
                alert('Usuario eliminado');
                cargarUsuarios();
            }
        } catch (error) {
            alert(error.message || 'Error al eliminar usuario');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/api/users/${selectedUser.id}/password`, { password: newPassword });
            if (response.success) {
                alert('Contraseña actualizada');
                setShowPasswordModal(false);
                setNewPassword('');
                setSelectedUser(null);
            }
        } catch (error) {
            alert(error.message || 'Error al cambiar contraseña');
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password });
    };

    if (user?.rol !== 'Admin') {
        return null;
    }

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="gestion-usuarios">
            <div className="header">
                <h1>Gestión de Usuarios</h1>
                <button className="btn-crear" onClick={() => setShowModal(true)}>
                    + Crear Usuario
                </button>
            </div>

            <div className="usuarios-grid">
                {usuarios.map(usuario => (
                    <div key={usuario.id} className={`usuario-card ${!usuario.activo ? 'inactivo' : ''}`}>
                        <div className="usuario-header">
                            <h3>{usuario.username}</h3>
                            <span className={`badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                                {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div className="usuario-info">
                            <p><strong>Rol:</strong> {usuario.rol}</p>
                            {usuario.dni_oficial && <p><strong>DNI:</strong> {usuario.dni_oficial}</p>}
                            <p><strong>Creado:</strong> {new Date(usuario.fecha_creacion).toLocaleDateString()}</p>
                            {usuario.ultimo_acceso && (
                                <p><strong>Último acceso:</strong> {new Date(usuario.ultimo_acceso).toLocaleDateString()}</p>
                            )}
                        </div>
                        <div className="usuario-actions">
                            <button 
                                className={`btn-toggle ${usuario.activo ? 'desactivar' : 'activar'}`}
                                onClick={() => handleToggle(usuario.id)}
                            >
                                {usuario.activo ? 'Desactivar' : 'Activar'}
                            </button>
                            <button 
                                className="btn-password"
                                onClick={() => {
                                    setSelectedUser(usuario);
                                    setShowPasswordModal(true);
                                }}
                            >
                                Cambiar Contraseña
                            </button>
                            <button 
                                className="btn-delete"
                                onClick={() => handleDelete(usuario.id)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Crear Nuevo Usuario</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contraseña</label>
                                <div className="password-input">
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={8}
                                    />
                                    <button type="button" onClick={generatePassword}>Generar</button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    value={formData.rol}
                                    onChange={e => setFormData({ ...formData, rol: e.target.value })}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Jefatura">Jefatura</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Oficial">Oficial</option>
                                    <option value="Cadete">Cadete</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>DNI Oficial (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.dniOficial}
                                    onChange={e => setFormData({ ...formData, dniOficial: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit">Crear Usuario</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Cambiar Contraseña</h2>
                        <p>Usuario: <strong>{selectedUser?.username}</strong></p>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                                <button type="submit">Cambiar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
