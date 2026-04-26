import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardHome from '../components/DashboardHome';
import Ciudadanos from '../components/Ciudadanos';
import Vehiculos from '../components/Vehiculos';
import Denuncias from '../components/Denuncias';
import Arrestos from '../components/Arrestos';
import Multas from '../components/Multas';
import BusquedaCaptura from '../components/BusquedaCaptura';
import Oficiales from '../components/Oficiales';
import Reportes from '../components/Reportes';
import CodigoPenal from '../components/CodigoPenal';
import Auditoria from '../components/Auditoria';
import CAD from '../components/CAD';
import GestionUsuarios from './GestionUsuarios';
import './Dashboard.css';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <DashboardHome setActiveView={setActiveView} />;
      case 'cad':
        return <CAD />;
      case 'ciudadanos':
        return <Ciudadanos />;
      case 'vehiculos':
        return <Vehiculos />;
      case 'denuncias':
        return <Denuncias />;
      case 'arrestos':
        return <Arrestos />;
      case 'multas':
        return <Multas />;
      case 'busqueda':
        return <BusquedaCaptura />;
      case 'oficiales':
        return <Oficiales />;
      case 'reportes':
        return ['Admin', 'Jefatura', 'Supervisor', 'Oficial'].includes(user?.rol) ? <Reportes /> : <DashboardHome setActiveView={setActiveView} />;
      case 'codigo-penal':
        return <CodigoPenal />;
      case 'auditoria':
        return ['Admin', 'Jefatura', 'Supervisor'].includes(user?.rol) ? <Auditoria /> : <DashboardHome setActiveView={setActiveView} />;
      case 'usuarios':
        return user?.rol === 'Admin' ? <GestionUsuarios /> : <DashboardHome setActiveView={setActiveView} />;
      default:
        return <DashboardHome setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className={`dashboard-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Header 
          user={user}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="dashboard-content">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
