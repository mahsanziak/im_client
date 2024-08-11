import React, { useEffect, useState } from 'react';
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
  const { restaurantId } = router.query; // Extract restaurantId from URL

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      console.log('No restaurantId found'); // This might happen on the first render
      return;
    }

    const fetchRestaurantData = async () => {
      console.log('Fetching restaurant data for restaurantId:', restaurantId);

      const { data, error } = await supabase
        .from('restaurants')
        .select('name, location')
        .eq('id', restaurantId)  // Ensure this matches the restaurantId
        .single();

      if (error) {
        console.error('Error fetching restaurant data:', error.message);
      } else {
        console.log('Fetched restaurant data:', data);
        setRestaurantName(data?.name || 'Unknown Restaurant');
        setLocation(data?.location || 'Unknown Location');
      }
    };

    fetchRestaurantData();
  }, [restaurantId]); // Re-run the effect when restaurantId changes

  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) {
        toggleSidebar(); // Minimize the sidebar when the route changes
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [isOpen, toggleSidebar, router.events]);

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
