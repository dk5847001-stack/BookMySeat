import { motion } from 'framer-motion';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import {
  ArrowRight,
  Armchair,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Flame,
  Globe2,
  ImagePlus,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Tag,
  Ticket,
  Trash2,
  Upload,
  UserRound
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { createElement, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  useForgotPasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
} from './features/auth/authApi.js';
import { setCredentials } from './features/auth/authSlice.js';
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery,
  useGetFeaturedEventsQuery,
  useGetTrendingEventsQuery,
  useUpdateEventMutation
} from './features/events/eventApi.js';
import {
  useGetSeatsQuery,
  useLockSeatsMutation,
  useReleaseSeatsMutation
} from './features/seats/seatApi.js';
import {
  useCreatePaymentOrderMutation,
  useRefundOrderMutation,
  useVerifyPaymentMutation
} from './features/payments/paymentApi.js';
import {
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
  useSendReminderEmailsMutation
} from './features/notifications/notificationApi.js';
import {
  useGetAdminDashboardQuery,
  useGetUserDashboardQuery,
  useUpdateProfileMutation
} from './features/dashboard/dashboardApi.js';

const MotionDiv = motion.div;
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const categories = ['music', 'business', 'sports', 'technology', 'arts', 'food'];
const sorts = [
  { label: 'Soonest', value: 'dateAsc' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price low', value: 'priceAsc' },
  { label: 'Price high', value: 'priceDesc' },
  { label: 'Seats', value: 'seats' }
];

const authModes = {
  login: 'login',
  register: 'register',
  forgot: 'forgot',
  reset: 'reset'
};

const blankEvent = {
  title: '',
  description: '',
  category: 'music',
  tags: '',
  date: '',
  location: '',
  price: '',
  totalSeats: '',
  availableSeats: '',
  image: '',
  imageFile: null,
  isFeatured: false
};

const fallbackImages = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'
];

const sampleEvents = [
  {
    _id: 'sample-1',
    title: 'Neon Nights Music Festival',
    description: 'A high-energy concert experience with premium seating zones and fast digital entry.',
    category: 'music',
    tags: ['festival', 'live'],
    date: new Date(Date.now() + 86400000 * 8).toISOString(),
    location: 'Mumbai Arena',
    price: 2499,
    totalSeats: 5000,
    availableSeats: 1280,
    isFeatured: true,
    views: 981,
    bookingsCount: 420,
    image: { url: fallbackImages[0] }
  },
  {
    _id: 'sample-2',
    title: 'Founder Summit Ultra',
    description: 'Enterprise SaaS talks, investor sessions, networking lounges, and curated founder workshops.',
    category: 'business',
    tags: ['summit', 'startup'],
    date: new Date(Date.now() + 86400000 * 16).toISOString(),
    location: 'Bengaluru Convention Center',
    price: 4999,
    totalSeats: 900,
    availableSeats: 214,
    isFeatured: false,
    views: 654,
    bookingsCount: 188,
    image: { url: fallbackImages[1] }
  },
  {
    _id: 'sample-3',
    title: 'Culinary Weekend Pass',
    description: 'Taste labs, chef tables, pop-up kitchens, and family-friendly food experiences.',
    category: 'food',
    tags: ['food', 'weekend'],
    date: new Date(Date.now() + 86400000 * 24).toISOString(),
    location: 'Delhi Expo Grounds',
    price: 899,
    totalSeats: 1800,
    availableSeats: 740,
    isFeatured: true,
    views: 422,
    bookingsCount: 136,
    image: { url: fallbackImages[2] }
  }
];

const getErrorMessage = (error) =>
  error?.data?.message || error?.error || 'Something went wrong. Please try again.';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

const seatPercent = (event) => Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const buildPreviewSeats = (event) => {
  if (!event) return [];
  const total = Math.min(Number(event.totalSeats || 0), 72);
  const bookedCount = Math.max(Math.min(total - Number(event.availableSeats || 0), total), 0);

  return Array.from({ length: total }, (_, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 12));
    const number = (index % 12) + 1;
    return {
      _id: `${event._id}-${row}${number}`,
      label: `${row}${number}`,
      row,
      number,
      status: index < bookedCount ? 'booked' : 'available'
    };
  });
};

export default function App() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const routeMode = pathParts[0] === 'reset-password' ? authModes.reset : authModes.login;
  const routeToken = pathParts[1] || '';
  const [authMode, setAuthMode] = useState(routeMode);
  const [authNotice, setAuthNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [filters, setFilters] = useState({ search: '', category: '', sort: 'dateAsc', page: 1, limit: 6 });
  const [eventForm, setEventForm] = useState(blankEvent);
  const [editingId, setEditingId] = useState('');
  const [eventNotice, setEventNotice] = useState('');
  const [activeEventId, setActiveEventId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [liveSeats, setLiveSeats] = useState([]);
  const [seatNotice, setSeatNotice] = useState('');
  const [latestBooking, setLatestBooking] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [liveUnread, setLiveUnread] = useState(0);
  const [adminFeed, setAdminFeed] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [theme, setTheme] = useState(() => localStorage.getItem('eventx_theme') || 'light');
  const [toast, setToast] = useState('');

  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const [forgotPassword, forgotState] = useForgotPasswordMutation();
  const [resetPassword, resetState] = useResetPasswordMutation();
  const [createEvent, createState] = useCreateEventMutation();
  const [updateEvent, updateState] = useUpdateEventMutation();
  const [deleteEvent, deleteState] = useDeleteEventMutation();
  const [lockSeats, lockState] = useLockSeatsMutation();
  const [releaseSeats, releaseState] = useReleaseSeatsMutation();
  const [createPaymentOrder, paymentOrderState] = useCreatePaymentOrderMutation();
  const [verifyPayment, verifyPaymentState] = useVerifyPaymentMutation();
  const [refundOrder, refundState] = useRefundOrderMutation();
  const [markNotificationsRead, readState] = useMarkNotificationsReadMutation();
  const [sendReminderEmails, reminderState] = useSendReminderEmailsMutation();
  const [updateProfile, profileState] = useUpdateProfileMutation();

  const queryParams = useMemo(() => {
    const params = { ...filters };
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });
    return params;
  }, [filters]);

  const { data: eventsResponse, isFetching: eventsLoading, isError: eventsErrored } = useGetEventsQuery(queryParams);
  const { data: featuredResponse } = useGetFeaturedEventsQuery();
  const { data: trendingResponse } = useGetTrendingEventsQuery();

  const events = eventsResponse?.data?.items?.length ? eventsResponse.data.items : sampleEvents;
  const pagination = eventsResponse?.data?.pagination || { page: 1, pages: 1, total: events.length };
  const featured = featuredResponse?.data?.length ? featuredResponse.data : sampleEvents.filter((event) => event.isFeatured);
  const trending = trendingResponse?.data?.length ? trendingResponse.data : [...sampleEvents].sort((a, b) => b.bookingsCount - a.bookingsCount);
  const isAdmin = user?.role === 'admin';
  const activeEvent = events.find((event) => event._id === activeEventId) || events[0];
  const activeEventIsPreview = !activeEvent || activeEvent._id.startsWith('sample');
  const { data: seatsResponse, isFetching: seatsLoading } = useGetSeatsQuery(activeEvent?._id, {
    skip: !activeEvent?._id || activeEventIsPreview
  });
  const { data: notificationsResponse } = useGetNotificationsQuery(undefined, { skip: !user });
  const { data: userDashboardResponse } = useGetUserDashboardQuery(undefined, { skip: !user });
  const { data: adminDashboardResponse } = useGetAdminDashboardQuery(undefined, { skip: !isAdmin });
  const seats = activeEventIsPreview ? buildPreviewSeats(activeEvent) : liveSeats.length ? liveSeats : seatsResponse?.data || [];
  const notifications = useMemo(() => {
    const persisted = notificationsResponse?.data?.items || [];
    const seen = new Set();
    return [...liveNotifications, ...persisted].filter((notification) => {
      const key = notification._id || `${notification.title}-${notification.message}-${notification.createdAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [liveNotifications, notificationsResponse]);
  const unreadNotifications = (notificationsResponse?.data?.unread || 0) + liveUnread;
  const userDashboard = userDashboardResponse?.data;
  const adminDashboard = adminDashboardResponse?.data;

  const authBusy = loginState.isLoading || registerState.isLoading || forgotState.isLoading || resetState.isLoading;
  const eventBusy = createState.isLoading || updateState.isLoading || deleteState.isLoading;
  const seatBusy = lockState.isLoading || releaseState.isLoading || paymentOrderState.isLoading || verifyPaymentState.isLoading || refundState.isLoading;
  const appBusy = authBusy || eventBusy || seatBusy || eventsLoading || seatsLoading;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('eventx_theme', theme);
  }, [theme]);

  useEffect(() => {
    const message = seatNotice || authNotice || eventNotice;
    if (!message) return undefined;
    setToast(message);
    const timer = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timer);
  }, [authNotice, eventNotice, seatNotice]);

  useEffect(() => {
    if (!events.length || activeEventId) return;
    setActiveEventId(events[0]._id);
  }, [activeEventId, events]);

  useEffect(() => {
    setLiveSeats(seatsResponse?.data || []);
  }, [seatsResponse]);

  useEffect(() => {
    setLiveNotifications([]);
    setLiveUnread(0);
    setAdminFeed([]);

    if (!user || !accessToken) return undefined;

    const socket = io(socketUrl, {
      withCredentials: true,
      auth: { token: accessToken }
    });

    socket.on('notification:new', (notification) => {
      setLiveNotifications((current) => [notification, ...current].slice(0, 8));
      setLiveUnread((current) => current + 1);
    });

    socket.on('notification:read-all', () => {
      setLiveUnread(0);
      setLiveNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    });

    socket.on('booking:confirmed', (payload) => {
      setLatestBooking((current) => current || null);
      setAdminFeed((current) => [{ type: 'booking', ...payload }, ...current].slice(0, 8));
    });

    socket.on('booking:cancelled', (payload) => {
      setAdminFeed((current) => [{ type: 'cancellation', ...payload }, ...current].slice(0, 8));
    });

    socket.on('admin:booking', (payload) => {
      setAdminFeed((current) => [{ type: 'booking', ...payload }, ...current].slice(0, 8));
    });

    socket.on('admin:refund', (payload) => {
      setAdminFeed((current) => [{ type: 'refund', ...payload }, ...current].slice(0, 8));
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, user]);

  useEffect(() => {
    if (!activeEvent?._id || activeEventIsPreview) return undefined;

    const socket = io(socketUrl, {
      withCredentials: true,
      auth: accessToken ? { token: accessToken } : undefined
    });
    socket.emit('join:event', activeEvent._id);
    socket.on('seats:update', (payload) => {
      if (payload.eventId === activeEvent._id) {
        setLiveSeats(payload.seats);
        setSelectedSeats((current) => current.filter((label) => payload.seats.some((seat) => seat.label === label && seat.status !== 'booked')));
      }
    });

    return () => {
      socket.emit('leave:event', activeEvent._id);
      socket.disconnect();
    };
  }, [accessToken, activeEvent?._id, activeEventIsPreview]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({ name: user.name || '', email: user.email || '' });
  }, [user]);

  const updateAuthForm = (event) => {
    setAuthForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const updateEventForm = (event) => {
    const { name, value, type, checked, files } = event.target;
    setEventForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthNotice('');

    try {
      if (authMode === authModes.register) {
        const response = await register(authForm).unwrap();
        dispatch(setCredentials(response.data));
        setAuthNotice('Account created. Your secure session is active.');
        return;
      }

      if (authMode === authModes.forgot) {
        const response = await forgotPassword({ email: authForm.email }).unwrap();
        setAuthNotice(response.data.message);
        return;
      }

      if (authMode === authModes.reset) {
        const response = await resetPassword({ token: routeToken, password: authForm.password }).unwrap();
        dispatch(setCredentials(response.data));
        setAuthNotice('Password reset complete. Your secure session is active.');
        return;
      }

      const response = await login({ email: authForm.email, password: authForm.password }).unwrap();
      dispatch(setCredentials(response.data));
      setAuthNotice('Welcome back. Your secure session is active.');
    } catch (error) {
      setAuthNotice(getErrorMessage(error));
    }
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setAuthNotice('');
    try {
      await updateProfile(profileForm).unwrap();
      setAuthNotice('Profile updated successfully.');
    } catch (error) {
      setAuthNotice(getErrorMessage(error));
    }
  };

  const submitEvent = async (event) => {
    event.preventDefault();
    setEventNotice('');

    const payload = {
      ...eventForm,
      tags: eventForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        await updateEvent({ id: editingId, ...payload }).unwrap();
        setEventNotice('Event updated successfully.');
      } else {
        await createEvent(payload).unwrap();
        setEventNotice('Event created successfully.');
      }
      setEventForm(blankEvent);
      setEditingId('');
    } catch (error) {
      setEventNotice(getErrorMessage(error));
    }
  };

  const editEvent = (event) => {
    setEditingId(event._id);
    setEventForm({
      title: event.title,
      description: event.description,
      category: event.category,
      tags: event.tags?.join(', ') || '',
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      price: event.price,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      image: event.image?.url || '',
      imageFile: null,
      isFeatured: Boolean(event.isFeatured)
    });
  };

  const removeEvent = async (id) => {
    setEventNotice('');
    try {
      await deleteEvent(id).unwrap();
      setEventNotice('Event deleted successfully.');
    } catch (error) {
      setEventNotice(getErrorMessage(error));
    }
  };

  const toggleSeat = (seat) => {
    if (seat.status !== 'available') return;
    setSelectedSeats((current) => (
      current.includes(seat.label)
        ? current.filter((label) => label !== seat.label)
        : [...current, seat.label].slice(0, 12)
    ));
  };

  const lockSelectedSeats = async () => {
    setSeatNotice('');
    if (activeEventIsPreview) {
      setSeatNotice('Live locking needs a real MongoDB event. Preview seats are read-only.');
      return;
    }

    try {
      const response = await lockSeats({ eventId: activeEvent._id, seats: selectedSeats }).unwrap();
      setSeatNotice(`Locked until ${new Date(response.data.lockExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
    } catch (error) {
      setSeatNotice(getErrorMessage(error));
    }
  };

  const releaseSelectedSeats = async () => {
    setSeatNotice('');
    try {
      await releaseSeats({ eventId: activeEvent._id, seats: selectedSeats }).unwrap();
      setSelectedSeats([]);
      setSeatNotice('Selected locks released.');
    } catch (error) {
      setSeatNotice(getErrorMessage(error));
    }
  };

  const bookSelectedSeats = async () => {
    setSeatNotice('');
    try {
      const orderResponse = await createPaymentOrder({ eventId: activeEvent._id, seats: selectedSeats }).unwrap();
      const payment = orderResponse.data;
      setSeatNotice(`Dummy payment order created: ${payment.orderId}. Verifying payment...`);
      const response = await verifyPayment({
        eventId: activeEvent._id,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        signature: payment.signature
      }).unwrap();
      setSelectedSeats([]);
      setLatestBooking(response.data.booking);
      setSeatNotice(`Payment successful. Booking confirmed: ${response.data.booking.bookingId}`);
    } catch (error) {
      setSeatNotice(getErrorMessage(error));
    }
  };

  const refundLatestBooking = async () => {
    if (!latestBooking?.orderId) return;
    setSeatNotice('');
    try {
      const response = await refundOrder(latestBooking.orderId).unwrap();
      setSeatNotice(`Refund processed: ${response.data.refundId}`);
      setLatestBooking((current) => current ? { ...current, paymentStatus: 'refunded', bookingStatus: 'cancelled' } : current);
    } catch (error) {
      setSeatNotice(getErrorMessage(error));
    }
  };

  return (
    <main className="min-h-screen bg-mesh text-ink transition-colors dark:bg-mesh-dark dark:text-white">
      {appBusy && <GlobalLoader />}
      {toast && <Toast message={toast} />}
      <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white shadow-glass">
              <Ticket size={22} />
            </div>
            <div>
              <p className="text-lg font-black tracking-normal">{t('app.name')}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/55">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/70 bg-white/60 px-4 text-sm font-bold shadow-glass backdrop-blur-xl transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              type="button"
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
            >
              <Globe2 size={16} />
              {i18n.language.toUpperCase()}
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/70 bg-white/60 px-4 text-sm font-bold shadow-glass backdrop-blur-xl transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              type="button"
              onClick={() => setTheme((value) => (value === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              {t('app.theme')}
            </button>
          </div>
        </nav>

        <div className="grid gap-8 py-8 lg:grid-cols-[1.25fr_0.75fr]">
          <MotionDiv initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="space-y-6">
            <div className="rounded-lg border border-white/75 bg-white/55 p-5 shadow-glass backdrop-blur-2xl sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-black text-white">
                    <Sparkles size={16} className="text-gold" />
                    {t('hero.badge')}
                  </div>
                  <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-6xl">
                    {t('hero.title')}
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-650">
                    {t('hero.subtitle')}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-glass">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Indexed events</p>
                  <p className="mt-2 text-3xl font-black">{pagination.total}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/75 bg-white/55 p-4 shadow-glass backdrop-blur-2xl">
              <div className="grid gap-3 lg:grid-cols-[1fr_170px_150px]">
                <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4">
                  <Search size={18} className="text-slate-400" />
                  <input
                    className="min-w-0 flex-1 outline-none"
                    placeholder="Search events, tags, location..."
                    value={filters.search}
                    onChange={(event) => updateFilter('search', event.target.value)}
                  />
                </label>
                <select className="h-12 rounded-lg border border-slate-200 bg-white px-4 font-bold outline-none" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select className="h-12 rounded-lg border border-slate-200 bg-white px-4 font-bold outline-none" value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}>
                  {sorts.map((sort) => (
                    <option key={sort.value} value={sort.value}>{sort.label}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`rounded-lg px-3 py-2 text-sm font-black capitalize transition ${filters.category === category ? 'bg-ink text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    type="button"
                    onClick={() => updateFilter('category', filters.category === category ? '' : category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {eventsErrored && (
              <div className="rounded-lg border border-pulse/20 bg-white/70 p-4 text-sm font-bold text-slate-700 shadow-glass backdrop-blur-xl">
                API events are unavailable, so preview data is shown. Start the backend with MongoDB to use live CRUD.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event, index) => (
                <EventCard
                  key={event._id}
                  event={event}
                  index={index}
                  isAdmin={isAdmin}
                  isActive={activeEvent?._id === event._id}
                  onSelect={setActiveEventId}
                  onEdit={editEvent}
                  onDelete={removeEvent}
                  busy={eventBusy}
                />
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/75 bg-white/55 p-3 shadow-glass backdrop-blur-xl">
              <button className="rounded-lg bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-40" type="button" disabled={filters.page <= 1 || eventsLoading} onClick={() => updateFilter('page', filters.page - 1)}>
                Previous
              </button>
              <p className="text-sm font-black text-slate-600">Page {pagination.page} of {pagination.pages}</p>
              <button className="rounded-lg bg-ink px-4 py-2 text-sm font-black text-white disabled:opacity-40" type="button" disabled={filters.page >= pagination.pages || eventsLoading} onClick={() => updateFilter('page', filters.page + 1)}>
                Next
              </button>
            </div>
          </MotionDiv>

          <aside className="space-y-5">
            <AuthPanel
              authMode={authMode}
              setAuthMode={setAuthMode}
              authForm={authForm}
              updateAuthForm={updateAuthForm}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              submitAuth={submitAuth}
              authNotice={authNotice}
              authBusy={authBusy}
              user={user}
            />

            <NotificationPanel
              user={user}
              isAdmin={isAdmin}
              notifications={notifications}
              unread={unreadNotifications}
              onMarkRead={markNotificationsRead}
              onSendReminders={sendReminderEmails}
              busy={readState.isLoading || reminderState.isLoading}
            />

            <AdminLivePanel isAdmin={isAdmin} feed={adminFeed} />

            <DashboardPanel
              user={user}
              isAdmin={isAdmin}
              userDashboard={userDashboard}
              adminDashboard={adminDashboard}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              onSubmitProfile={submitProfile}
              busy={profileState.isLoading}
            />

            <SeatMapPanel
              event={activeEvent}
              seats={seats}
              selectedSeats={selectedSeats}
              onToggleSeat={toggleSeat}
              onLock={lockSelectedSeats}
              onRelease={releaseSelectedSeats}
              onBook={bookSelectedSeats}
              notice={seatNotice}
              booking={latestBooking}
              onRefund={refundLatestBooking}
              busy={seatBusy || seatsLoading}
              isPreview={activeEventIsPreview}
              user={user}
            />

            <SpotlightPanel title="Featured" icon={BadgeCheck} events={featured} />
            <SpotlightPanel title="Trending" icon={Flame} events={trending} />

            <AdminEventForm
              isAdmin={isAdmin}
              eventForm={eventForm}
              updateEventForm={updateEventForm}
              submitEvent={submitEvent}
              editingId={editingId}
              setEditingId={setEditingId}
              setEventForm={setEventForm}
              notice={eventNotice}
              busy={eventBusy}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}

function GlobalLoader() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-white/30">
      <div className="h-full w-1/2 animate-pulse bg-pulse shadow-glass" />
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="fixed right-4 top-5 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-white/75 bg-white/90 p-4 text-sm font-bold leading-6 text-ink shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-ink/90 dark:text-white">
      <LoaderCircle size={18} className="mt-0.5 shrink-0 animate-spin text-aurora" />
      <span>{message}</span>
    </div>
  );
}

function EventCard({ event, index, isAdmin, isActive, onSelect, onEdit, onDelete, busy }) {
  const sold = seatPercent(event);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className={`overflow-hidden rounded-lg border bg-white/70 shadow-glass backdrop-blur-xl ${isActive ? 'border-ink' : 'border-white/75'}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <img className="h-full w-full object-cover" src={event.image?.url || fallbackImages[index % fallbackImages.length]} alt={event.title} />
        <div className="absolute left-3 top-3 flex gap-2">
          {event.isFeatured && <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-ink">Featured</span>}
          <span className="rounded-lg bg-ink/85 px-2 py-1 text-xs font-black capitalize text-white">{event.category}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-black leading-6">{event.title}</h3>
          <p className="whitespace-nowrap rounded-lg bg-aurora/15 px-2 py-1 text-sm font-black text-emerald-700">₹{event.price}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{event.description}</p>
        <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
          <span className="flex items-center gap-2"><CalendarDays size={15} />{formatDate(event.date)}</span>
          <span className="flex items-center gap-2"><MapPin size={15} />{event.location}</span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            <span>{event.availableSeats} seats left</span>
            <span>{sold}% sold</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-pulse" style={{ width: `${Math.min(sold, 100)}%` }} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(event.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>
        {isAdmin && !event._id.startsWith('sample') && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink text-sm font-black text-white" type="button" onClick={() => onEdit(event)}>
              <Edit3 size={15} />
              Edit
            </button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-pulse text-sm font-black text-white disabled:opacity-50" type="button" disabled={busy} onClick={() => onDelete(event._id)}>
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        )}
        <button
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={() => onSelect(event._id)}
        >
          <Armchair size={16} />
          {isActive ? 'Seat map active' : 'Select seats'}
        </button>
      </div>
    </MotionDiv>
  );
}

function SeatMapPanel({ event, seats, selectedSeats, onToggleSeat, onLock, onRelease, onBook, notice, booking, onRefund, busy, isPreview, user }) {
  const counts = seats.reduce(
    (acc, seat) => {
      acc[seat.status] = (acc[seat.status] || 0) + 1;
      return acc;
    },
    { available: 0, locked: 0, booked: 0 }
  );

  return (
    <div className="rounded-lg border border-white/75 bg-white/70 p-4 shadow-glass backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Armchair size={18} />
            <h3 className="font-black">Live seat map</h3>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {event ? event.title : 'Choose an event'} seats sync through Socket.io and locks expire after 5 minutes.
          </p>
        </div>
        <span className="rounded-lg bg-ink px-2 py-1 text-xs font-black text-white">{selectedSeats.length} selected</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <SeatStat label="Available" value={counts.available || 0} tone="bg-aurora/15 text-emerald-700" />
        <SeatStat label="Locked" value={counts.locked || 0} tone="bg-gold/25 text-yellow-700" />
        <SeatStat label="Booked" value={counts.booked || 0} tone="bg-pulse/15 text-rose-700" />
      </div>

      <div className="mt-4 rounded-lg bg-ink p-3">
        <div className="mb-3 rounded-lg bg-white/10 py-2 text-center text-xs font-black uppercase tracking-[0.18em] text-white/60">
          Stage
        </div>
        <div className="grid max-h-72 grid-cols-12 gap-1 overflow-auto pr-1">
          {seats.slice(0, 180).map((seat) => {
            const selected = selectedSeats.includes(seat.label);
            const className = selected
              ? 'bg-white text-ink ring-2 ring-aurora'
              : seat.status === 'available'
                ? 'bg-aurora/80 text-ink hover:bg-aurora'
                : seat.status === 'locked'
                  ? 'bg-gold/80 text-ink'
                  : 'bg-pulse/80 text-white';

            return (
              <button
                key={seat._id || seat.label}
                className={`aspect-square rounded-md text-[10px] font-black transition ${className} disabled:cursor-not-allowed disabled:opacity-75`}
                type="button"
                disabled={seat.status !== 'available' || busy}
                title={`${seat.label} ${seat.status}`}
                onClick={() => onToggleSeat(seat)}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>

      {isPreview && (
        <p className="mt-3 rounded-lg bg-white p-3 text-sm font-bold leading-6 text-slate-600">
          Preview map shown. Create a real event and start the backend to use live locks.
        </p>
      )}

      {notice && <p className="mt-3 rounded-lg bg-white p-3 text-sm font-bold leading-6 text-slate-600">{notice}</p>}

      {booking && <BookingConfirmation booking={booking} onRefund={onRefund} user={user} busy={busy} />}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink text-sm font-black text-white disabled:opacity-45" type="button" disabled={!user || !selectedSeats.length || busy} onClick={onLock}>
          <Clock3 size={15} />
          Lock
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white text-sm font-black text-slate-700 disabled:opacity-45" type="button" disabled={!user || !selectedSeats.length || busy || isPreview} onClick={onRelease}>
          Release
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-pulse text-sm font-black text-white disabled:opacity-45" type="button" disabled={!user || !selectedSeats.length || busy || isPreview} onClick={onBook}>
          <CreditCard size={15} />
          Pay
        </button>
      </div>
    </div>
  );
}

function BookingConfirmation({ booking, onRefund, user, busy }) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

  return (
    <div className="mt-4 rounded-lg border border-aurora/30 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Booking confirmed</p>
          <h3 className="mt-1 text-xl font-black">{booking.bookingId}</h3>
          <p className="mt-1 text-sm font-bold text-slate-600">Seats {booking.seats.join(', ')} | INR {booking.totalAmount}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Order {booking.orderId || 'direct'} | {booking.paymentStatus}
          </p>
        </div>
        <img className="h-16 w-16 rounded-lg border border-slate-100" src={booking.qrCode} alt={`QR for booking ${booking.bookingId}`} />
      </div>
      <div className="mt-4 grid gap-2">
        {booking.tickets?.map((ticket) => (
          <div key={ticket.ticketCode} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
            <div>
              <p className="text-sm font-black">Seat {ticket.seat}</p>
              <p className="text-xs font-bold text-slate-500">{ticket.ticketCode}</p>
            </div>
            <img className="h-12 w-12 rounded-md" src={ticket.qrCode} alt={`QR for ${ticket.ticketCode}`} />
          </div>
        ))}
      </div>
      <a
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-black text-white"
        href={`${apiBase}/bookings/${booking.bookingId}/ticket.pdf`}
        target="_blank"
        rel="noreferrer"
      >
        <Download size={16} />
        Download ticket PDF
      </a>
      {user?.role === 'admin' && booking.orderId && booking.paymentStatus !== 'refunded' && (
        <button
          className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-pulse text-sm font-black text-white disabled:opacity-50"
          type="button"
          disabled={busy}
          onClick={onRefund}
        >
          Refund order
        </button>
      )}
    </div>
  );
}

function NotificationPanel({ user, isAdmin, notifications, unread, onMarkRead, onSendReminders, busy }) {
  if (!user) {
    return (
      <div className="rounded-lg border border-white/75 bg-white/60 p-4 shadow-glass backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Bell size={18} />
          <h3 className="font-black">Notifications</h3>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Sign in to receive booking confirmations, reminders, cancellation alerts, and payment updates.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/75 bg-white/70 p-4 shadow-glass backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell size={18} />
          <h3 className="font-black">Notifications</h3>
          {unread > 0 && <span className="rounded-lg bg-pulse px-2 py-1 text-xs font-black text-white">{unread}</span>}
        </div>
        <button className="text-xs font-black text-slate-500 disabled:opacity-40" type="button" disabled={busy || unread === 0} onClick={onMarkRead}>
          Mark read
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {notifications.slice(0, 4).map((notification) => (
          <div key={notification._id} className={`rounded-lg p-3 ${notification.isRead ? 'bg-white/70' : 'bg-aurora/15'}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-black">{notification.title}</p>
              <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black uppercase text-slate-500">{notification.type}</span>
            </div>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{notification.message}</p>
          </div>
        ))}
        {!notifications.length && (
          <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-600">No notifications yet.</p>
        )}
      </div>

      {isAdmin && (
        <button className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-black text-white disabled:opacity-50" type="button" disabled={busy} onClick={onSendReminders}>
          <Mail size={15} />
          Send due reminders
        </button>
      )}
    </div>
  );
}

function AdminLivePanel({ isAdmin, feed }) {
  if (!isAdmin) return null;

  return (
    <div className="rounded-lg border border-white/75 bg-ink p-4 text-white shadow-glass">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-gold" />
          <h3 className="font-black">Live admin feed</h3>
        </div>
        <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-black">{feed.length}</span>
      </div>

      <div className="mt-4 space-y-2">
        {feed.slice(0, 5).map((item, index) => (
          <div key={`${item.type}-${item.bookingId}-${index}`} className="rounded-lg bg-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black capitalize">{item.type}</p>
              <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black uppercase text-ink">
                Live
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold leading-5 text-white/70">
              {item.eventTitle || 'Event update'} {item.bookingId ? `- ${item.bookingId}` : ''}
            </p>
            {item.user && <p className="mt-1 text-xs font-bold text-white/50">{item.user}</p>}
          </div>
        ))}
        {!feed.length && (
          <p className="rounded-lg bg-white/10 p-3 text-sm font-semibold text-white/65">
            Booking and refund alerts will appear here in real time.
          </p>
        )}
      </div>
    </div>
  );
}

function DashboardPanel({ user, isAdmin, userDashboard, adminDashboard, profileForm, setProfileForm, onSubmitProfile, busy }) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

  if (!user) {
    return (
      <div className="rounded-lg border border-white/75 bg-white/60 p-4 shadow-glass backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Settings size={18} />
          <h3 className="font-black">Dashboards</h3>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Sign in to view bookings, profile settings, tickets, and analytics.
        </p>
      </div>
    );
  }

  const revenueByMonth = adminDashboard?.analytics?.revenueByMonth || [];
  const revenueByEvent = adminDashboard?.analytics?.revenueByEvent || [];
  const lineData = {
    labels: revenueByMonth.map((item) => item._id),
    datasets: [
      {
        label: 'Revenue',
        data: revenueByMonth.map((item) => item.revenue),
        borderColor: '#ff5c7a',
        backgroundColor: 'rgba(255, 92, 122, 0.2)'
      }
    ]
  };
  const barData = {
    labels: revenueByEvent.map((item) => item.eventTitle),
    datasets: [
      {
        label: 'Bookings',
        data: revenueByEvent.map((item) => item.bookings),
        backgroundColor: '#00d1b2'
      }
    ]
  };

  return (
    <div className="rounded-lg border border-white/75 bg-white/70 p-4 shadow-glass backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Settings size={18} />
          <h3 className="font-black">{isAdmin ? 'Admin dashboard' : 'User dashboard'}</h3>
        </div>
        <a className="rounded-lg bg-ink px-3 py-2 text-xs font-black text-white" href={`${apiBase}/dashboard/reports/bookings.csv`} target="_blank" rel="noreferrer">
          CSV
        </a>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <DashboardStat label="Bookings" value={userDashboard?.stats?.bookings || 0} />
        <DashboardStat label="Upcoming" value={userDashboard?.stats?.upcoming || 0} />
        <DashboardStat label="Spent" value={`₹${userDashboard?.stats?.totalSpent || 0}`} />
      </div>

      <form className="mt-4 space-y-2" onSubmit={onSubmitProfile}>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Profile settings</p>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
          value={profileForm.name}
          onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Name"
        />
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
          value={profileForm.email}
          onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="Email"
          type="email"
        />
        <button className="h-10 w-full rounded-lg bg-ink text-sm font-black text-white disabled:opacity-50" type="submit" disabled={busy}>
          Save profile
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">My bookings</p>
        {(userDashboard?.bookings || []).slice(0, 4).map((booking) => (
          <div key={booking.bookingId} className="rounded-lg bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black">{booking.eventId?.title || booking.bookingId}</p>
                <p className="text-xs font-bold text-slate-500">Seats {booking.seats.join(', ')}</p>
              </div>
              <a className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600" href={`${apiBase}/bookings/${booking.bookingId}/ticket.pdf`} target="_blank" rel="noreferrer">
                Ticket
              </a>
            </div>
          </div>
        ))}
        {!userDashboard?.bookings?.length && <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-600">No bookings yet.</p>}
      </div>

      {isAdmin && adminDashboard && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center">
            <DashboardStat label="Users" value={adminDashboard.stats.users} />
            <DashboardStat label="Revenue" value={`₹${adminDashboard.stats.revenue}`} />
          </div>

          <div className="rounded-lg bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Revenue analytics</p>
              <a className="text-xs font-black text-pulse" href={`${apiBase}/dashboard/reports/revenue.csv`} target="_blank" rel="noreferrer">Export</a>
            </div>
            {revenueByMonth.length ? <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <p className="text-sm font-semibold text-slate-600">No revenue data yet.</p>}
          </div>

          <div className="rounded-lg bg-white p-3">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Bookings by event</p>
            {revenueByEvent.length ? <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <p className="text-sm font-semibold text-slate-600">No booking data yet.</p>}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Recent users</p>
            {adminDashboard.users.slice(0, 4).map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-lg bg-white p-3">
                <div>
                  <p className="text-sm font-black">{item.name}</p>
                  <p className="text-xs font-bold text-slate-500">{item.email}</p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{item.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardStat({ label, value }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  );
}

function SeatStat({ label, value, tone }) {
  return (
    <div className={`rounded-lg p-3 ${tone}`}>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.12em]">{label}</p>
    </div>
  );
}

function AuthPanel({ authMode, setAuthMode, authForm, updateAuthForm, showPassword, setShowPassword, submitAuth, authNotice, authBusy, user }) {
  const title = authMode === authModes.register ? 'Create account' : authMode === authModes.forgot ? 'Recover password' : authMode === authModes.reset ? 'Reset password' : 'Sign in';

  return (
    <div className="rounded-lg border border-white/75 bg-ink p-5 text-white shadow-glass">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white/55">Secure access</p>
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/10">
          <KeyRound size={20} />
        </div>
      </div>

      {user ? (
        <div className="mt-5 rounded-lg bg-white p-4 text-ink">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Active session</p>
          <p className="mt-2 text-xl font-black">{user.name}</p>
          <p className="text-sm font-semibold text-slate-600">{user.email}</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-aurora/15 px-2 py-1 text-xs font-black text-emerald-700">{user.role}</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">active</span>
          </div>
        </div>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={submitAuth}>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/8 p-1">
            {[authModes.login, authModes.register, authModes.forgot].map((mode) => (
              <button key={mode} className={`h-9 rounded-lg text-xs font-black capitalize ${authMode === mode ? 'bg-white text-ink' : 'text-white/60'}`} type="button" onClick={() => setAuthMode(mode)}>
                {mode}
              </button>
            ))}
          </div>

          {authMode === authModes.register && (
            <AuthInput icon={UserRound} name="name" placeholder="Full name" value={authForm.name} onChange={updateAuthForm} />
          )}
          {authMode !== authModes.reset && (
            <AuthInput icon={Mail} name="email" placeholder="Email address" type="email" value={authForm.email} onChange={updateAuthForm} />
          )}
          {authMode !== authModes.forgot && (
            <label className="flex h-11 items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3">
              <LockKeyhole size={17} className="text-white/50" />
              <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35" name="password" placeholder="Password" type={showPassword ? 'text' : 'password'} value={authForm.password} onChange={updateAuthForm} />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </label>
          )}
          {authNotice && <p className="rounded-lg bg-white/10 p-3 text-sm font-bold leading-6 text-white/75">{authNotice}</p>}
          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-black text-ink disabled:opacity-50" type="submit" disabled={authBusy}>
            {authBusy ? 'Processing...' : title}
            <ArrowRight size={16} />
          </button>
        </form>
      )}
    </div>
  );
}

function AuthInput({ icon: Icon, ...props }) {
  return (
    <label className="flex h-11 items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3">
      {createElement(Icon, { size: 17, className: 'text-white/50' })}
      <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35" {...props} />
    </label>
  );
}

function SpotlightPanel({ title, icon: Icon, events }) {
  return (
    <div className="rounded-lg border border-white/75 bg-white/60 p-4 shadow-glass backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2">
        {createElement(Icon, { size: 18 })}
        <h3 className="font-black">{title}</h3>
      </div>
      <div className="space-y-2">
        {events.slice(0, 3).map((event) => (
          <div key={event._id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3">
            <div>
              <p className="text-sm font-black">{event.title}</p>
              <p className="text-xs font-bold text-slate-500">{event.location}</p>
            </div>
            <p className="text-xs font-black text-pulse">₹{event.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminEventForm({ isAdmin, eventForm, updateEventForm, submitEvent, editingId, setEditingId, setEventForm, notice, busy }) {
  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-white/75 bg-white/60 p-4 shadow-glass backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} />
          <h3 className="font-black">Admin event tools</h3>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Sign in as an admin to create, edit, delete, feature, and upload event media.
        </p>
      </div>
    );
  }

  return (
    <form className="rounded-lg border border-white/75 bg-white/70 p-4 shadow-glass backdrop-blur-xl" onSubmit={submitEvent}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} />
          <h3 className="font-black">{editingId ? 'Edit event' : 'Create event'}</h3>
        </div>
        {editingId && (
          <button className="text-xs font-black text-pulse" type="button" onClick={() => { setEditingId(''); setEventForm(blankEvent); }}>
            Cancel
          </button>
        )}
      </div>
      <div className="space-y-3">
        <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="title" placeholder="Event title" value={eventForm.title} onChange={updateEventForm} />
        <textarea className="min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm font-semibold outline-none" name="description" placeholder="Description" value={eventForm.description} onChange={updateEventForm} />
        <div className="grid grid-cols-2 gap-2">
          <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none" name="category" value={eventForm.category} onChange={updateEventForm}>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="tags" placeholder="tags, comma separated" value={eventForm.tags} onChange={updateEventForm} />
        </div>
        <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="location" placeholder="Location" value={eventForm.location} onChange={updateEventForm} />
        <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="date" type="datetime-local" value={eventForm.date} onChange={updateEventForm} />
        <div className="grid grid-cols-3 gap-2">
          <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="price" placeholder="Price" type="number" value={eventForm.price} onChange={updateEventForm} />
          <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="totalSeats" placeholder="Total" type="number" value={eventForm.totalSeats} onChange={updateEventForm} />
          <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="availableSeats" placeholder="Left" type="number" value={eventForm.availableSeats} onChange={updateEventForm} />
        </div>
        <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none" name="image" placeholder="Image URL fallback" value={eventForm.image} onChange={updateEventForm} />
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white text-sm font-black text-slate-600">
          <ImagePlus size={17} />
          {eventForm.imageFile?.name || 'Upload Cloudinary image'}
          <input className="hidden" name="imageFile" type="file" accept="image/*" onChange={updateEventForm} />
        </label>
        <label className="flex items-center gap-2 text-sm font-black text-slate-600">
          <input name="isFeatured" type="checkbox" checked={eventForm.isFeatured} onChange={updateEventForm} />
          Feature this event
        </label>
        {notice && <p className="rounded-lg bg-white p-3 text-sm font-bold text-slate-600">{notice}</p>}
        <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-black text-white disabled:opacity-50" type="submit" disabled={busy}>
          {busy ? 'Saving...' : editingId ? 'Update event' : 'Create event'}
          {editingId ? <CheckCircle2 size={16} /> : <Upload size={16} />}
        </button>
      </div>
    </form>
  );
}
