import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import sidebarStyles from '../styles/Sidebar.module.css';
import { supabase } from '../utils/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const isSidebarOpenRef = useRef(isOpen); // Ref to track sidebar state

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    const fetchRestaurantData = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name, location')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant data:', error.message);
      } else {
        setRestaurantName(data?.name || 'Unknown Restaurant');
        setLocation(data?.location || 'Unknown Location');
      }
    };

    fetchRestaurantData();
  }, [restaurantId]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (isSidebarOpenRef.current) {
        toggleSidebar(); // Toggle sidebar to minimize it
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, toggleSidebar]);

  useEffect(() => {
    isSidebarOpenRef.current = isOpen; // Sync ref with current state
  }, [isOpen]);

  return (
    <div>
      <div className={`${sidebarStyles.sidebar} ${isOpen ? sidebarStyles.sidebarOpen : sidebarStyles.sidebarClosed}`}>
        <div className={sidebarStyles.header}>
          {isOpen ? (
            <>
              <div className={sidebarStyles.franchiseeName}>{restaurantName}</div>
              <div className={sidebarStyles.location}>{location}</div>
            </>
          ) : (
            <i className="fas fa-utensils text-2xl"></i>
          )}
        </div>
        <ul className={sidebarStyles.menu}>
          <li>
            <Link href={`/restaurants/${restaurantId}/overview`} className={sidebarStyles.menuItem}>
              <i className="fas fa-home"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Overview</span>}
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/request-order`} className={sidebarStyles.menuItem}>
              <i className="fas fa-shopping-cart"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Request Order</span>}
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/orders`} className={sidebarStyles.menuItem}>
              <i className="fas fa-list"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Orders</span>}
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/billing`} className={sidebarStyles.menuItem}>
              <i className="fas fa-file-invoice-dollar"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Billing</span>}
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/recommendations`} className={sidebarStyles.menuItem}>
              <i className="fas fa-lightbulb"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Recommendations</span>}
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/settings`} className={sidebarStyles.menuItem}>
              <i className="fas fa-cog"></i>
              {isOpen && <span className={sidebarStyles.menuText}>Settings</span>}
            </Link>
          </li>
        </ul>
      </div>

      <div className={sidebarStyles.toggleButton} onClick={toggleSidebar}>
        <button className={sidebarStyles.button}>
          <i className={`fas ${isOpen ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
