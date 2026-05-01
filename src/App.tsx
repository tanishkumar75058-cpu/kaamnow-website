import { AnimatePresence, motion } from "framer-motion";
import {
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type ProviderStatus = "active" | "inactive";
type BookingStatus = "New" | "Accepted" | "Rejected" | "Confirmed" | "Completed" | "Cancelled";
type StateSetter<T> = Dispatch<SetStateAction<T>>;
type InstallOutcome = "accepted" | "dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
};

type Service = {
  id: string;
  name: string;
  icon: string;
};

type Worker = {
  id: string;
  name: string;
  phone: string;
  service: string;
  area: string;
  experience: number;
  rating: number;
  price: string;
  status: ProviderStatus;
  fastService: boolean;
  image: string;
  createdAt: string;
};

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  worker: string;
  workerPhone: string;
  status: BookingStatus;
  dateTime: string;
  area: string;
  address: string;
  notes: string;
  quotedPrice: string;
};

type AdminCredentials = {
  username: string;
  password: string;
};

type ProfileFormState = {
  name: string;
  phone: string;
  service: string;
  area: string;
  experience: string;
  price: string;
  status: ProviderStatus;
  fastService: boolean;
  image: string;
};

type WorkerDraft = {
  name: string;
  phone: string;
  service: string;
  area: string;
  experience: string;
  rating: string;
  price: string;
  status: ProviderStatus;
  fastService: boolean;
  image: string;
};

type BookingDraft = {
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  notes: string;
};

type BookingConfirmation = {
  booking: Booking;
  worker: Worker;
};

const WORKERS_KEY = "kaamnow_workers";
const SERVICES_KEY = "kaamnow_services";
const BOOKINGS_KEY = "kaamnow_bookings";
const ADMIN_KEY = "kaamnow_admin_credentials";
const ADMIN_SESSION_KEY = "kaamnow_admin_session";
const SUPPORT_PHONE = "917409010714";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const KAAMNOW_ICON = "/icons/kaamnow-icon.png";
const HERO_IMAGES = [
  "/images/kaamnow-technician.jpg",
  "/images/kaamnow-electrician.jpg",
  "/images/kaamnow-ac-service.jpg",
];

const DEFAULT_SERVICES: Service[] = [
  { id: "plumber", name: "Plumber", icon: "🔧" },
  { id: "electrician", name: "Electrician", icon: "⚡" },
  { id: "ac-repair", name: "AC Repair", icon: "❄️" },
  { id: "carpenter", name: "Carpenter", icon: "🪚" },
  { id: "painter", name: "Painter", icon: "🎨" },
];

const DEFAULT_WORKERS: Worker[] = [
  {
    id: "worker-ramesh",
    name: "Ramesh Kumar",
    phone: "9876543210",
    service: "Plumber",
    area: "Hapur",
    experience: 7,
    rating: 4.9,
    price: "299",
    status: "active",
    fastService: true,
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-01-01T09:00:00.000Z",
  },
  {
    id: "worker-arif",
    name: "Arif Khan",
    phone: "9876501234",
    service: "Electrician",
    area: "Hapur",
    experience: 5,
    rating: 4.8,
    price: "249",
    status: "active",
    fastService: true,
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "worker-sunil",
    name: "Sunil Sharma",
    phone: "9812345670",
    service: "AC Repair",
    area: "Hapur",
    experience: 6,
    rating: 4.7,
    price: "399",
    status: "inactive",
    fastService: false,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-01-03T09:00:00.000Z",
  },
  {
    id: "worker-dev",
    name: "Devendra Singh",
    phone: "9897012345",
    service: "Carpenter",
    area: "Hapur",
    experience: 9,
    rating: 4.9,
    price: "499",
    status: "active",
    fastService: true,
    image:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-01-04T09:00:00.000Z",
  },
  {
    id: "worker-manoj",
    name: "Manoj Verma",
    phone: "9911223344",
    service: "Painter",
    area: "Hapur",
    experience: 4,
    rating: 4.6,
    price: "349",
    status: "inactive",
    fastService: false,
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "booking-1",
    customerName: "Nitin Tyagi",
    customerPhone: "9876000001",
    service: "Plumber",
    worker: "Ramesh Kumar",
    workerPhone: "9876543210",
    status: "Accepted",
    dateTime: "Today, 11:30 AM",
    area: "Hapur",
    address: "Free Ganj Road, Hapur",
    notes: "Kitchen tap leakage repair",
    quotedPrice: "299",
  },
  {
    id: "booking-2",
    customerName: "Sana Malik",
    customerPhone: "9876000002",
    service: "Electrician",
    worker: "Arif Khan",
    workerPhone: "9876501234",
    status: "New",
    dateTime: "Today, 02:00 PM",
    area: "Hapur",
    address: "Railway Road, Hapur",
    notes: "Switchboard issue",
    quotedPrice: "249",
  },
];

const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: "Tanish",
  password: "Tanish@123",
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local images can be large. If storage is full, keep the in-memory state alive.
  }
}

function useLocalStorageState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

function normalizedPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function whatsAppLink(phone: string, message: string) {
  return `https://wa.me/${normalizedPhone(phone)}?text=${encodeURIComponent(message)}`;
}

function avatarFor(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420"><rect width="600" height="420" fill="#2563EB"/><circle cx="470" cy="90" r="160" fill="#FACC15" opacity="0.9"/><circle cx="120" cy="330" r="180" fill="#1E40AF"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="118" font-weight="800" fill="white">${initials || "K"}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Please upload JPG, JPEG, or PNG only.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5MB or smaller.";
  }

  return "";
}

function serviceIcon(services: Service[], serviceName: string) {
  return services.find((service) => service.name === serviceName)?.icon ?? "🛠️";
}

function workerPriceLabel(price?: string) {
  const cleanPrice = price?.trim();
  if (!cleanPrice) {
    return "Price on call";
  }

  if (cleanPrice.toLowerCase().includes("price")) {
    return cleanPrice;
  }

  return cleanPrice.toLowerCase().startsWith("rs") ? `Starts ${cleanPrice}` : `Starts Rs. ${cleanPrice}`;
}

function BlueTick() {
  return (
    <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-[#2563EB] text-white shadow-md shadow-blue-500/30">
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 8.2 6.6 11.2 12.8 4.8"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function isActiveCustomerBooking(booking: Booking) {
  return !["Cancelled", "Completed", "Rejected"].includes(booking.status);
}

function bookingBelongsToWorker(booking: Booking, worker: Worker) {
  if (booking.workerPhone) {
    return normalizedPhone(booking.workerPhone) === normalizedPhone(worker.phone);
  }

  return booking.worker === worker.name;
}

function findActiveBookingForWorker(bookings: Booking[], worker: Worker) {
  return bookings.find(
    (booking) => isActiveCustomerBooking(booking) && bookingBelongsToWorker(booking, worker)
  );
}

function getBookingsForWorker(bookings: Booking[], worker: Worker) {
  return bookings.filter((booking) => bookingBelongsToWorker(booking, worker));
}

function isAcceptedBooking(status: BookingStatus) {
  return status === "Accepted" || status === "Confirmed" || status === "Completed";
}

function bookingStatusClass(status: BookingStatus) {
  if (status === "Accepted" || status === "Confirmed") {
    return "bg-green-100 text-[#15803D]";
  }

  if (status === "Rejected" || status === "Cancelled") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Completed") {
    return "bg-blue-100 text-[#2563EB]";
  }

  return "bg-yellow-100 text-yellow-800";
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid shrink-0 place-items-center rounded-2xl bg-[#1E3A8A] font-black text-white shadow-lg shadow-blue-950/20 ${
          compact ? "h-10 w-10 text-xl" : "h-16 w-16 text-4xl sm:h-20 sm:w-20 sm:text-5xl"
        }`}
      >
        <span className="bg-gradient-to-br from-[#FACC15] via-orange-400 to-[#2563EB] bg-clip-text text-transparent">
          K
        </span>
      </span>
      <span
        className={`font-black tracking-tight ${compact ? "text-xl" : "text-4xl sm:text-6xl"}`}
      >
        Kaam<span className="text-[#FACC15]">now</span>
      </span>
    </div>
  );
}

function SearchBar({
  query,
  services,
  workers,
  onQueryChange,
  onSearch,
}: {
  query: string;
  services: Service[];
  workers: Worker[];
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    const terms = [
      ...services.map((service) => service.name),
      ...workers.map((worker) => worker.name),
      ...workers.map((worker) => worker.area),
    ];
    const uniqueTerms = Array.from(new Set(terms));
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return services.map((service) => service.name).slice(0, 5);
    }

    return uniqueTerms
      .filter((term) => term.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [query, services, workers]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch();
  }

  function handleSuggestionClick(suggestion: string) {
    onQueryChange(suggestion);
    setIsFocused(false);
    window.setTimeout(onSearch, 50);
  }

  return (
    <form className="relative w-full" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="service-search">
        Search service
      </label>
      <div className="flex items-center rounded-2xl bg-white px-4 py-2.5 text-[#1F2937] shadow-lg shadow-blue-950/10 ring-1 ring-white/30 transition focus-within:ring-2 focus-within:ring-[#2563EB]">
        <svg
          className="mr-3 h-5 w-5 text-[#2563EB]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m21 21-4.35-4.35" />
          <circle cx="11" cy="11" r="7" />
        </svg>
        <input
          id="service-search"
          value={query}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search service (Plumber, Electrician...)"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 sm:text-base"
        />
      </div>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl bg-white text-[#1F2937] shadow-2xl shadow-blue-950/20 ring-1 ring-gray-100"
          >
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition hover:bg-blue-50"
                >
                  <span>{suggestion}</span>
                  <span className="text-xs font-bold text-[#2563EB]">Search</span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </form>
  );
}

function Header({
  query,
  services,
  workers,
  onQueryChange,
  onSearch,
  onAddProfile,
  onInstallApp,
  installMessage,
  onAdminOpen,
}: {
  query: string;
  services: Service[];
  workers: Worker[];
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onAddProfile: () => void;
  onInstallApp: () => void;
  installMessage: string;
  onAdminOpen: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function runMenuAction(action: () => void) {
    setIsMenuOpen(false);
    action();
  }

  return (
    <header className="sticky top-0 z-40 bg-[#2563EB] text-white shadow-xl shadow-blue-950/15">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <BrandMark compact />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/40 transition hover:bg-white hover:text-[#2563EB]"
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
        </div>
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            query={query}
            services={services}
            workers={workers}
            onQueryChange={onQueryChange}
            onSearch={onSearch}
          />
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.22 }}
              className="fixed right-3 top-3 z-50 w-[min(92vw,360px)] rounded-[2rem] bg-white p-4 text-[#1F2937] shadow-2xl shadow-blue-950/30 ring-1 ring-gray-100 sm:right-6 sm:top-6"
            >
              <div className="flex items-center justify-between gap-3">
                <BrandMark compact />
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-black text-gray-700 transition hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => runMenuAction(onSearch)}
                  className="rounded-2xl bg-blue-50 px-4 py-3 text-left text-sm font-black text-[#2563EB]"
                >
                  Find Services
                </button>
                <button
                  type="button"
                  onClick={() => runMenuAction(onAddProfile)}
                  className="rounded-2xl border-2 border-[#2563EB] px-4 py-3 text-left text-sm font-black text-[#2563EB]"
                >
                  Add Your Profile
                </button>
                <button
                  type="button"
                  onClick={onInstallApp}
                  className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-left text-sm font-black text-[#1E3A8A] ring-1 ring-blue-100"
                >
                  <img src={KAAMNOW_ICON} alt="Kaamnow app logo" className="h-9 w-9 rounded-xl object-cover" />
                  <span>Add to Desktop</span>
                </button>
                {installMessage ? (
                  <p className="rounded-2xl bg-yellow-50 px-4 py-3 text-xs font-bold leading-5 text-yellow-900 ring-1 ring-yellow-100">
                    {installMessage}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => runMenuAction(onAdminOpen)}
                  className="rounded-2xl bg-[#1E3A8A] px-4 py-3 text-left text-sm font-black text-white"
                >
                  Admin Dashboard
                </button>
                <a
                  href={`tel:+${SUPPORT_PHONE}`}
                  className="rounded-2xl bg-[#FACC15] px-4 py-3 text-left text-sm font-black text-black"
                >
                  Call Now: +{SUPPORT_PHONE}
                </a>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function Hero({ onAddProfile }: { onAddProfile: () => void }) {
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="relative isolate min-h-[82svh] overflow-hidden bg-[#111827] text-white">
      <AnimatePresence mode="sync">
        <motion.div
          key={HERO_IMAGES[heroImageIndex]}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.15, ease: "easeOut" }}
          className="absolute inset-0 -z-20 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url('${HERO_IMAGES[heroImageIndex]}')` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-black/60" />

      <div className="mx-auto flex min-h-[82svh] w-full max-w-6xl items-center px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="drop-shadow-[0_16px_45px_rgba(250,204,21,0.35)]"
          >
            <BrandMark />
          </motion.div>
          <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-r from-white via-[#FACC15] to-orange-300 bg-clip-text text-transparent drop-shadow-[0_8px_28px_rgba(250,204,21,0.35)]">
              Kaamnow
            </span>
            <span className="mt-2 block text-3xl sm:text-5xl lg:text-6xl">
              Get Trusted Local Services in Hapur within 30–60 Minutes
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-xl font-semibold text-gray-100 sm:text-2xl">
            Plumber, Electrician, AC Repair & More
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href={whatsAppLink(
                SUPPORT_PHONE,
                "Hi Kaamnow, I need a trusted local service provider in Hapur."
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-6 py-3.5 text-base font-black text-white shadow-xl shadow-blue-950/30 transition hover:bg-[#1E40AF]"
            >
              Book on WhatsApp
            </a>
            <a
              href={`tel:+${SUPPORT_PHONE}`}
              className="inline-flex items-center justify-center rounded-full bg-[#FACC15] px-6 py-3.5 text-base font-black text-black shadow-xl shadow-yellow-950/20 transition hover:bg-yellow-300"
            >
              Call Now
            </a>
            <button
              type="button"
              onClick={onAddProfile}
              className="inline-flex items-center justify-center rounded-full border-2 border-[#2563EB] bg-transparent px-6 py-3.5 text-base font-black text-white transition hover:bg-[#2563EB]"
            >
              Add Your Profile
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CategoryGrid({
  services,
  onPickCategory,
}: {
  services: Service[];
  onPickCategory: (service: string) => void;
}) {
  return (
    <section className="bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#1F2937]">Top Categories</h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Tap a service to find nearby providers in Hapur.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {services.slice(0, 5).map((service, index) => (
            <motion.button
              key={service.id}
              type="button"
              onClick={() => onPickCategory(service.name)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="group flex items-center gap-3 rounded-3xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-100/70"
            >
              <span className="text-3xl" aria-hidden="true">
                {service.icon}
              </span>
              <span className="text-sm font-black text-[#1F2937] group-hover:text-[#2563EB]">
                {service.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const roundedRating = Math.round(rating);

  return (
    <div className="flex items-center gap-1" aria-label={`${rating.toFixed(1)} rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < roundedRating ? "text-[#FACC15]" : "text-gray-300"}>
          ★
        </span>
      ))}
      <span className="ml-1 text-sm font-black text-[#1F2937]">{rating.toFixed(1)}</span>
    </div>
  );
}

function WorkerCard({
  worker,
  activeBooking,
  onBook,
  onViewBooking,
}: {
  worker: Worker;
  activeBooking?: Booking;
  onBook: (worker: Worker) => void;
  onViewBooking: (booking: Booking, worker: Worker) => void;
}) {
  const isAvailable = worker.status === "active";

  return (
    <article className="snap-center overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-950/10 ring-1 ring-gray-100">
      <img
        src={worker.image || avatarFor(worker.name)}
        alt={`${worker.name} profile`}
        className="h-72 w-full object-cover sm:h-80"
      />
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#1F2937]">
              <span>{worker.name}</span>
              {worker.fastService ? <BlueTick /> : null}
            </h3>
            <p className="mt-1 text-sm font-bold text-[#2563EB]">{worker.service}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              isAvailable ? "bg-green-100 text-[#15803D]" : "bg-gray-100 text-gray-600"
            }`}
          >
            {isAvailable ? "Available Now" : "Busy"}
          </span>
        </div>

        <RatingStars rating={worker.rating} />

        <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-gray-600">
          <div>
            <span className="block text-xs uppercase tracking-wide text-gray-400">Experience</span>
            <span className="text-[#1F2937]">{worker.experience} years</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-gray-400">Area</span>
            <span className="text-[#1F2937]">{worker.area}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-gray-400">Price</span>
            <span className="text-[#1F2937]">{workerPriceLabel(worker.price)}</span>
          </div>
          <div className="col-span-2 rounded-2xl bg-[#F9FAFB] px-3 py-2">
            <span className="block text-xs uppercase tracking-wide text-gray-400">Phone Number</span>
            <a href={`tel:+${normalizedPhone(worker.phone)}`} className="text-[#1F2937]">
              {worker.phone}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:+${normalizedPhone(worker.phone)}`}
            className="rounded-2xl bg-[#FACC15] px-4 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-300"
          >
            Call Now
          </a>
          <a
            href={whatsAppLink(
              worker.phone,
              `Hi ${worker.name}, I found you on Kaamnow and need ${worker.service} service in Hapur.`
            )}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-[#2563EB] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#1E40AF]"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => onBook(worker)}
            className={`col-span-2 rounded-2xl px-4 py-3 text-center text-sm font-black text-white transition ${
              activeBooking ? "hidden" : "bg-[#2563EB] hover:bg-[#1E40AF]"
            }`}
          >
            Order Service
          </button>
        </div>

        {activeBooking ? (
          <div className="rounded-3xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <p className="text-sm font-black text-[#1E3A8A]">Aapka order is profile par active hai</p>
            <p className="mt-1 text-xs font-bold text-gray-600">
              Status: {activeBooking.status} • {activeBooking.dateTime}
            </p>
            <button
              type="button"
              onClick={() => onViewBooking(activeBooking, worker)}
              className="mt-3 w-full rounded-2xl bg-[#2563EB] px-4 py-3 text-sm font-black text-white transition hover:bg-[#1E40AF]"
            >
              View / Cancel Order
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProviderSlider({
  workers,
  bookings,
  query,
  sliderRef,
  onBook,
  onViewBooking,
}: {
  workers: Worker[];
  bookings: Booking[];
  query: string;
  sliderRef: React.RefObject<HTMLElement | null>;
  onBook: (worker: Worker) => void;
  onViewBooking: (booking: Booking, worker: Worker) => void;
}) {
  const filteredWorkers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedWorkers = [...workers].sort((a, b) => {
      if (a.status === b.status) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return a.status === "active" ? -1 : 1;
    });

    if (!normalizedQuery) {
      return sortedWorkers;
    }

    return sortedWorkers.filter((worker) =>
      [worker.name, worker.service, worker.area].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query, workers]);

  return (
    <section ref={sliderRef} className="bg-[#F9FAFB] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-[#1F2937]">
            Trusted providers near you
          </h2>
          <p className="mt-2 text-base font-medium text-gray-500">
            Swipe side-to-side to compare profiles, ratings, availability, and quick contact options.
          </p>
        </div>

        {filteredWorkers.length > 0 ? (
          <>
            <div className="mb-3 flex justify-center">
              <motion.div
                animate={{ x: [-8, 8, -8] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#2563EB] shadow-lg shadow-blue-950/10 ring-1 ring-blue-100"
              >
                <span aria-hidden="true">←</span>
                <span>Profile ko side swipe karein</span>
                <span aria-hidden="true">→</span>
              </motion.div>
            </div>
            <div className="slider-scroll -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-5 sm:-mx-6 sm:px-6">
              {filteredWorkers.map((worker, index) => (
                <motion.div
                  key={worker.id}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="w-[calc(100vw-2rem)] shrink-0 sm:w-[380px]"
                >
                  <WorkerCard
                    worker={worker}
                    activeBooking={findActiveBookingForWorker(bookings, worker)}
                    onBook={onBook}
                    onViewBooking={onViewBooking}
                  />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center sm:hidden">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-gray-500 shadow-sm ring-1 ring-gray-100">
                More profiles ke liye left/right scroll karein
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-lg font-black text-[#1F2937]">No provider found for "{query}".</p>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Try Plumber, Electrician, AC Repair, Carpenter, or Painter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function BookingModal({
  worker,
  onClose,
  onSave,
}: {
  worker: Worker;
  onClose: () => void;
  onSave: (booking: Booking) => void;
}) {
  const [draft, setDraft] = useState<BookingDraft>({
    customerName: "",
    customerPhone: "",
    area: "Hapur",
    address: "",
    notes: "",
  });
  const [error, setError] = useState("");

  function updateDraft(field: keyof BookingDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phoneDigits = draft.customerPhone.replace(/\D/g, "");

    if (!draft.customerName.trim() || !draft.customerPhone.trim() || !draft.area.trim()) {
      setError("Name, phone number, and area are required.");
      return;
    }

    if (phoneDigits.length < 10) {
      setError("Please enter a valid customer phone number.");
      return;
    }

    onSave({
      id: `booking-${Date.now()}`,
      customerName: draft.customerName.trim(),
      customerPhone: draft.customerPhone.trim(),
      service: worker.service,
      worker: worker.name,
      workerPhone: worker.phone,
      status: "New",
      dateTime: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      area: draft.area.trim(),
      address: draft.address.trim(),
      notes: draft.notes.trim(),
      quotedPrice: worker.price || "Price on call",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/70 p-4"
    >
      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.22 }}
        onSubmit={handleSubmit}
        className="mx-auto mt-8 max-w-lg rounded-[2rem] bg-white p-5 text-[#1F2937] shadow-2xl shadow-blue-950/30 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#2563EB]">Order Service</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">{worker.service}</h3>
            <p className="mt-1 text-sm font-bold text-gray-500">
              Worker: {worker.name} - {workerPriceLabel(worker.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-black text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <input
            value={draft.customerName}
            onChange={(event) => updateDraft("customerName", event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="Customer name"
          />
          <input
            value={draft.customerPhone}
            onChange={(event) => updateDraft("customerPhone", event.target.value)}
            inputMode="tel"
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="Customer phone number"
          />
          <input
            value={draft.area}
            onChange={(event) => updateDraft("area", event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="Area"
          />
          <input
            value={draft.address}
            onChange={(event) => updateDraft("address", event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="Address / landmark"
          />
          <textarea
            value={draft.notes}
            onChange={(event) => updateDraft("notes", event.target.value)}
            className="min-h-24 rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="Problem details"
          />
        </div>

        {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}

        <button className="mt-5 w-full rounded-2xl bg-[#2563EB] px-5 py-4 font-black text-white transition hover:bg-[#1E40AF]">
          Submit Order
        </button>
        <p className="mt-3 text-center text-xs font-bold text-gray-500">
          Order details admin dashboard ke Bookings panel me save ho jayengi.
        </p>
      </motion.form>
    </motion.div>
  );
}

function OrderConfirmationModal({
  booking,
  worker,
  onClose,
  onCancel,
  onFindAnother,
}: {
  booking: Booking;
  worker: Worker;
  onClose: () => void;
  onCancel: () => void;
  onFindAnother: () => void;
}) {
  const orderMessage = `Hi ${worker.name}, I ordered ${booking.service} on Kaamnow. Customer: ${booking.customerName}, Phone: ${booking.customerPhone}, Area: ${booking.area}, Address: ${booking.address || "Not added"}, Details: ${booking.notes || "Not added"}.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] overflow-y-auto bg-slate-950/70 p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.22 }}
        className="mx-auto mt-5 max-w-lg rounded-[2.5rem] bg-white p-6 text-[#1F2937] shadow-2xl shadow-blue-950/30 sm:mt-8 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#2563EB] sm:text-lg">
              Order Submitted
            </p>
            <h3 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Contact {worker.name}
            </h3>
            <p className="mt-5 text-lg font-semibold leading-8 text-gray-500 sm:text-2xl">
              {booking.service} • {booking.area || worker.area} • {workerPriceLabel(booking.quotedPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[1.6rem] bg-gray-100 px-6 py-4 text-base font-black text-gray-700 transition hover:bg-gray-200 sm:text-xl"
          >
            Close
          </button>
        </div>

        <div className="mt-8 rounded-[2rem] bg-[#F9FAFB] p-5 text-lg leading-9 text-gray-700 sm:p-6 sm:text-2xl">
          <p>
            <span className="font-black text-slate-950">Customer:</span> {booking.customerName}
          </p>
          <p>
            <span className="font-black text-slate-950">Phone:</span> {booking.customerPhone}
          </p>
          <p>
            <span className="font-black text-slate-950">Area:</span> {booking.area || "Hapur"}
          </p>
          <p>
            <span className="font-black text-slate-950">Time:</span> {booking.dateTime}
          </p>
        </div>

        <div className="mt-7 grid gap-4">
          <a
            href={`tel:+${normalizedPhone(worker.phone)}`}
            className="rounded-[1.7rem] bg-[#FACC15] px-5 py-4 text-center text-lg font-black text-black transition hover:bg-yellow-300"
          >
            Call Provider
          </a>
          <a
            href={whatsAppLink(worker.phone, orderMessage)}
            target="_blank"
            rel="noreferrer"
            className="rounded-[1.7rem] border-2 border-[#22C55E] bg-white px-5 py-4 text-center text-lg font-black text-[#15803D] transition hover:bg-green-50"
          >
            WhatsApp
          </a>
        </div>

        <div className="mt-7 rounded-[2rem] bg-blue-50 p-5 text-lg font-medium leading-9 text-[#1E40AF] ring-1 ring-blue-100 sm:p-6 sm:text-2xl">
          Notice: agar 5 min ma service dene vala ki or sa koi response na aaye to kisi or service provider ko contact karein.
          <button
            type="button"
            onClick={onFindAnother}
            className="mt-4 block text-base font-black text-[#2563EB] underline decoration-2 underline-offset-4"
          >
            Dusra provider dekhein
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-7 w-full rounded-[1.7rem] border border-red-200 bg-red-50 px-5 py-4 text-lg font-black text-red-600 transition hover:bg-red-100"
        >
          Cancel Service
        </button>
      </motion.div>
    </motion.div>
  );
}

function ImageUpload({
  image,
  onImageChange,
  error,
  onError,
}: {
  image: string;
  onImageChange: (image: string) => void;
  error: string;
  onError: (error: string) => void;
}) {
  const inputId = useId();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      onError(validationMessage);
      event.currentTarget.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageChange(reader.result);
        onError("");
      }
    };
    reader.onerror = () => onError("Image preview failed. Please try another image.");
    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-black text-[#1F2937]">Upload Image</span>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="overflow-hidden rounded-3xl border border-dashed border-blue-200 bg-blue-50/60">
          {image ? (
            <img src={image} alt="Upload preview" className="h-44 w-full object-cover" />
          ) : (
            <div className="grid h-44 place-items-center px-4 text-center text-sm font-bold text-gray-500">
              JPG, PNG, JPEG up to 5MB
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label
            htmlFor={`${inputId}-camera`}
            className="cursor-pointer rounded-2xl bg-[#2563EB] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#1E40AF]"
          >
            Camera 📷
          </label>
          <label
            htmlFor={`${inputId}-gallery`}
            className="cursor-pointer rounded-2xl border-2 border-[#2563EB] px-4 py-3 text-center text-sm font-black text-[#2563EB] transition hover:bg-blue-50"
          >
            Gallery 🖼️
          </label>
          <input
            id={`${inputId}-camera`}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            className="sr-only"
            onChange={handleFileChange}
          />
          <input
            id={`${inputId}-gallery`}
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
    </div>
  );
}

function AddProfileSection({
  services,
  onAddWorker,
  sectionRef,
}: {
  services: Service[];
  onAddWorker: (worker: Worker) => void;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const firstService = services[0]?.name ?? "Plumber";
  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    phone: "",
    service: firstService,
    area: "Hapur",
    experience: "",
    price: "",
    status: "active",
    fastService: false,
    image: "",
  });
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!services.some((service) => service.name === form.service)) {
      setForm((current) => ({ ...current, service: firstService }));
    }
  }, [firstService, form.service, services]);

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (!form.name.trim() || !form.phone.trim() || !form.area.trim() || !form.experience.trim()) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (phoneDigits.length < 10) {
      setFormError("Please enter a valid phone number.");
      return;
    }

    if (!form.image) {
      setFormError("Please upload a profile image before submitting.");
      return;
    }

    const experience = Number.parseInt(form.experience, 10);
    if (Number.isNaN(experience) || experience < 0) {
      setFormError("Experience must be a valid number.");
      return;
    }

    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      service: form.service,
      area: form.area.trim(),
      experience,
      rating: 4.7,
      price: form.price.trim(),
      status: form.status,
      fastService: form.fastService,
      image: form.image,
      createdAt: new Date().toISOString(),
    };

    onAddWorker(newWorker);
    setForm({
      name: "",
      phone: "",
      service: firstService,
      area: "Hapur",
      experience: "",
      price: "",
      status: "active",
      fastService: false,
      image: "",
    });
    setFormError("");
    setImageError("");
    setSuccessMessage("Profile saved and added to the provider slider instantly.");
    window.setTimeout(() => setSuccessMessage(""), 4000);
  }

  return (
    <section ref={sectionRef} className="bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#2563EB]">Self registration</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1F2937] sm:text-4xl">
            Add your Kaamnow profile
          </h2>
          <p className="mt-4 text-base font-medium leading-7 text-gray-500">
            Register as a local provider, upload your image from camera or gallery, and start appearing in the Hapur provider slider.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[2rem] bg-[#F9FAFB] p-4 shadow-xl shadow-blue-950/5 ring-1 ring-gray-100 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-black text-[#1F2937]">
              Name
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Your full name"
              />
            </label>
            <label className="space-y-2 text-sm font-black text-[#1F2937]">
              Phone Number
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                inputMode="tel"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="9876543210"
              />
            </label>
            <label className="space-y-2 text-sm font-black text-[#1F2937]">
              Service Type
              <select
                value={form.service}
                onChange={(event) => updateField("service", event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.icon} {service.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-black text-[#1F2937]">
              Area
              <input
                value={form.area}
                onChange={(event) => updateField("area", event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Hapur"
              />
            </label>
            <label className="space-y-2 text-sm font-black text-[#1F2937]">
              Experience
              <input
                value={form.experience}
                onChange={(event) => updateField("experience", event.target.value)}
                inputMode="numeric"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Years"
              />
            </label>
            <label className="space-y-2 text-sm font-black text-[#1F2937]">
              Starting Price
              <input
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                inputMode="numeric"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Example: 299"
              />
            </label>
            <div className="space-y-2 text-sm font-black text-[#1F2937]">
              Status
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    status: current.status === "active" ? "inactive" : "active",
                  }))
                }
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 font-black transition ${
                  form.status === "active"
                    ? "border-green-200 bg-green-50 text-[#15803D]"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                <span>{form.status === "active" ? "Active / Available" : "Inactive / Busy"}</span>
                <span
                  className={`h-6 w-11 rounded-full p-1 transition ${
                    form.status === "active" ? "bg-[#22C55E]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition ${
                      form.status === "active" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>
            <div className="space-y-2 text-sm font-black text-[#1F2937]">
              Fast Service Blue Tick
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({ ...current, fastService: !current.fastService }))
                }
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 font-black transition ${
                  form.fastService
                    ? "border-blue-200 bg-blue-50 text-[#2563EB]"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                <span>{form.fastService ? "Blue tick enabled" : "Blue tick off"}</span>
                {form.fastService ? <BlueTick /> : <span className="h-6 w-6 rounded-full bg-gray-200" />}
              </button>
            </div>
          </div>

          <ImageUpload
            image={form.image}
            onImageChange={(image) => updateField("image", image)}
            error={imageError}
            onError={setImageError}
          />

          {formError ? <p className="text-sm font-bold text-red-600">{formError}</p> : null}
          {successMessage ? <p className="text-sm font-bold text-[#15803D]">{successMessage}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#2563EB] px-5 py-4 text-base font-black text-white transition hover:bg-[#1E40AF]"
          >
            Save Profile
          </button>
        </form>
      </div>
    </section>
  );
}

function OverviewPanel({
  workers,
  services,
  bookings,
}: {
  workers: Worker[];
  services: Service[];
  bookings: Booking[];
}) {
  const activeWorkers = workers.filter((worker) => worker.status === "active").length;
  const inactiveWorkers = workers.length - activeWorkers;
  const acceptedOrders = bookings.filter((booking) => isAcceptedBooking(booking.status)).length;
  const rejectedOrders = bookings.filter((booking) => booking.status === "Rejected").length;
  const stats = [
    { label: "Total Workers", value: workers.length, tone: "text-[#2563EB]" },
    { label: "Total Services", value: services.length, tone: "text-[#2563EB]" },
    { label: "Total Orders", value: bookings.length, tone: "text-[#2563EB]" },
    { label: "Accepted Orders", value: acceptedOrders, tone: "text-[#15803D]" },
    { label: "Rejected Orders", value: rejectedOrders, tone: "text-red-600" },
    { label: "Active Providers", value: activeWorkers, tone: "text-[#15803D]" },
    { label: "Inactive Providers", value: inactiveWorkers, tone: "text-gray-500" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-black text-gray-500">{stat.label}</p>
          <p className={`mt-3 text-4xl font-black ${stat.tone}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function ServiceManagement({
  services,
  setServices,
}: {
  services: Service[];
  setServices: StateSetter<Service[]>;
}) {
  const [serviceName, setServiceName] = useState("");
  const [serviceIconValue, setServiceIconValue] = useState("🛠️");
  const [editingId, setEditingId] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftIcon, setDraftIcon] = useState("");

  function handleAddService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!serviceName.trim()) {
      return;
    }

    setServices((current) => [
      ...current,
      {
        id: `service-${Date.now()}`,
        name: serviceName.trim(),
        icon: serviceIconValue.trim() || "🛠️",
      },
    ]);
    setServiceName("");
    setServiceIconValue("🛠️");
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setDraftName(service.name);
    setDraftIcon(service.icon);
  }

  function saveEdit() {
    if (!draftName.trim()) {
      return;
    }

    setServices((current) =>
      current.map((service) =>
        service.id === editingId
          ? { ...service, name: draftName.trim(), icon: draftIcon.trim() || "🛠️" }
          : service
      )
    );
    setEditingId("");
  }

  function deleteService(serviceId: string) {
    setServices((current) => current.filter((service) => service.id !== serviceId));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <form onSubmit={handleAddService} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h3 className="text-xl font-black text-[#1F2937]">Add New Service</h3>
        <div className="mt-5 grid gap-3">
          <input
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="Service name"
          />
          <input
            value={serviceIconValue}
            onChange={(event) => setServiceIconValue(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="Icon"
          />
          <button className="rounded-2xl bg-[#2563EB] px-4 py-3 font-black text-white transition hover:bg-[#1E40AF]">
            Add Service
          </button>
        </div>
      </form>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h3 className="text-xl font-black text-[#1F2937]">Edit / Delete Service</h3>
        <div className="mt-5 space-y-3">
          {services.map((service) => (
            <div key={service.id} className="rounded-2xl border border-gray-100 p-4">
              {editingId === service.id ? (
                <div className="grid gap-3 sm:grid-cols-[80px_1fr_auto]">
                  <input
                    value={draftIcon}
                    onChange={(event) => setDraftIcon(event.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2 font-semibold outline-none focus:border-[#2563EB]"
                  />
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2 font-semibold outline-none focus:border-[#2563EB]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="rounded-xl bg-[#2563EB] px-3 py-2 text-sm font-black text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId("")}
                      className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-black text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <span className="font-black text-[#1F2937]">{service.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(service)}
                      className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-[#2563EB]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteService(service.id)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function createWorkerDraft(worker: Worker): WorkerDraft {
  return {
    name: worker.name,
    phone: worker.phone,
    service: worker.service,
    area: worker.area,
    experience: String(worker.experience),
    rating: String(worker.rating),
    price: worker.price ?? "",
    status: worker.status,
    fastService: Boolean(worker.fastService),
    image: worker.image,
  };
}

function WorkerManagement({
  workers,
  setWorkers,
  services,
  bookings,
}: {
  workers: Worker[];
  setWorkers: StateSetter<Worker[]>;
  services: Service[];
  bookings: Booking[];
}) {
  const [nameFilter, setNameFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<WorkerDraft | null>(null);
  const [imageError, setImageError] = useState("");

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchesName = worker.name.toLowerCase().includes(nameFilter.trim().toLowerCase());
      const matchesArea = worker.area.toLowerCase().includes(areaFilter.trim().toLowerCase());
      const matchesService = serviceFilter ? worker.service === serviceFilter : true;
      return matchesName && matchesArea && matchesService;
    });
  }, [areaFilter, nameFilter, serviceFilter, workers]);

  function startEdit(worker: Worker) {
    setEditingId(worker.id);
    setDraft(createWorkerDraft(worker));
    setImageError("");
  }

  function updateDraft(field: keyof WorkerDraft, value: string) {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  }

  function saveWorker() {
    if (!draft || !editingId) {
      return;
    }

    const experience = Number.parseInt(draft.experience, 10);
    const rating = Number.parseFloat(draft.rating);

    if (!draft.name.trim() || !draft.phone.trim() || Number.isNaN(experience) || Number.isNaN(rating)) {
      return;
    }

    setWorkers((current) =>
      current.map((worker) =>
        worker.id === editingId
          ? {
              ...worker,
              name: draft.name.trim(),
              phone: draft.phone.trim(),
              service: draft.service,
              area: draft.area.trim(),
              experience,
              rating: Math.max(0, Math.min(5, rating)),
              price: draft.price.trim(),
              status: draft.status,
              fastService: draft.fastService,
              image: draft.image || avatarFor(draft.name),
            }
          : worker
      )
    );
    setEditingId("");
    setDraft(null);
  }

  function deleteWorker(workerId: string) {
    setWorkers((current) => current.filter((worker) => worker.id !== workerId));
  }

  function toggleStatus(workerId: string) {
    setWorkers((current) =>
      current.map((worker) =>
        worker.id === workerId
          ? { ...worker, status: worker.status === "active" ? "inactive" : "active" }
          : worker
      )
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h3 className="text-xl font-black text-[#1F2937]">Search & Filter</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="By name"
          />
          <select
            value={serviceFilter}
            onChange={(event) => setServiceFilter(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
          <input
            value={areaFilter}
            onChange={(event) => setAreaFilter(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            placeholder="By area"
          />
        </div>
      </div>

      {draft ? (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h3 className="text-xl font-black text-[#1F2937]">Edit Worker</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              value={draft.name}
              onChange={(event) => updateDraft("name", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB]"
              placeholder="Name"
            />
            <input
              value={draft.phone}
              onChange={(event) => updateDraft("phone", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB]"
              placeholder="Phone"
            />
            <select
              value={draft.service}
              onChange={(event) => updateDraft("service", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB]"
            >
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
            <input
              value={draft.area}
              onChange={(event) => updateDraft("area", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB]"
              placeholder="Area"
            />
            <input
              value={draft.experience}
              onChange={(event) => updateDraft("experience", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB]"
              placeholder="Experience"
            />
            <input
              value={draft.rating}
              onChange={(event) => updateDraft("rating", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB]"
              placeholder="Rating"
            />
            <input
              value={draft.price}
              onChange={(event) => updateDraft("price", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB]"
              placeholder="Starting price"
            />
          </div>
          <div className="mt-4">
            <ImageUpload
              image={draft.image}
              onImageChange={(image) => updateDraft("image", image)}
              error={imageError}
              onError={setImageError}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => updateDraft("status", draft.status === "active" ? "inactive" : "active")}
              className="rounded-2xl bg-gray-100 px-4 py-3 font-black text-gray-700"
            >
              Status: {draft.status === "active" ? "Active" : "Inactive"}
            </button>
            <button
              type="button"
              onClick={() =>
                setDraft((current) =>
                  current ? { ...current, fastService: !current.fastService } : current
                )
              }
              className="rounded-2xl bg-blue-50 px-4 py-3 font-black text-[#2563EB]"
            >
              Blue Tick: {draft.fastService ? "On" : "Off"}
            </button>
            <button
              type="button"
              onClick={saveWorker}
              className="rounded-2xl bg-[#2563EB] px-4 py-3 font-black text-white"
            >
              Save Worker
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId("");
                setDraft(null);
              }}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-black text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="flex gap-4">
              <img
                src={worker.image || avatarFor(worker.name)}
                alt={`${worker.name} profile`}
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="flex items-center gap-2 font-black text-[#1F2937]">
                      <span>{worker.name}</span>
                      {worker.fastService ? <BlueTick /> : null}
                    </h4>
                    <p className="text-sm font-bold text-[#2563EB]">
                      {serviceIcon(services, worker.service)} {worker.service}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      worker.status === "active"
                        ? "bg-green-100 text-[#15803D]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {worker.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-gray-500">
                  <span>Phone: {worker.phone}</span>
                  <span>Area: {worker.area}</span>
                  <span>Experience: {worker.experience} years</span>
                  <span>Rating: {worker.rating.toFixed(1)}</span>
                  <span>Price: {workerPriceLabel(worker.price)}</span>
                  <span>Blue Tick: {worker.fastService ? "Fast" : "Off"}</span>
                  <span>Total Orders: {getBookingsForWorker(bookings, worker).length}</span>
                  <span>
                    Accepted: {getBookingsForWorker(bookings, worker).filter((booking) => isAcceptedBooking(booking.status)).length}
                  </span>
                  <span>
                    Rejected: {getBookingsForWorker(bookings, worker).filter((booking) => booking.status === "Rejected").length}
                  </span>
                  <span>
                    Completed: {getBookingsForWorker(bookings, worker).filter((booking) => booking.status === "Completed").length}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(worker)}
                    className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-[#2563EB]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(worker.id)}
                    className="rounded-xl bg-yellow-100 px-3 py-2 text-sm font-black text-yellow-800"
                  >
                    Change Status
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteWorker(worker.id)}
                    className="rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsPanel({
  bookings,
  setBookings,
}: {
  bookings: Booking[];
  setBookings: StateSetter<Booking[]>;
}) {
  const providerSummaries = useMemo(() => {
    const summaryMap = new Map<
      string,
      {
        worker: string;
        service: string;
        total: number;
        accepted: number;
        rejected: number;
        completed: number;
      }
    >();

    bookings.forEach((booking) => {
      const key = booking.workerPhone || booking.worker;
      const summary = summaryMap.get(key) ?? {
        worker: booking.worker,
        service: booking.service,
        total: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
      };

      summary.total += 1;
      summary.accepted += isAcceptedBooking(booking.status) ? 1 : 0;
      summary.rejected += booking.status === "Rejected" ? 1 : 0;
      summary.completed += booking.status === "Completed" ? 1 : 0;
      summaryMap.set(key, summary);
    });

    return Array.from(summaryMap.values());
  }, [bookings]);

  function updateBookingStatus(bookingId: string, status: BookingStatus) {
    setBookings((current) =>
      current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
    );
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-xl font-black text-[#1F2937]">Bookings / Website Orders</h3>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {providerSummaries.map((summary) => (
          <div key={`${summary.worker}-${summary.service}`} className="rounded-2xl bg-[#F9FAFB] p-4 ring-1 ring-gray-100">
            <p className="font-black text-[#1F2937]">{summary.worker}</p>
            <p className="mt-1 text-xs font-bold text-[#2563EB]">{summary.service}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-gray-500">
              <span>Total Orders: {summary.total}</span>
              <span>Accepted: {summary.accepted}</span>
              <span>Rejected: {summary.rejected}</span>
              <span>Completed: {summary.completed}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="grid gap-4 rounded-2xl border border-gray-100 p-4 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-black text-[#1F2937]">Ordered by: {booking.customerName}</h4>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${bookingStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-500">
                Service: {booking.service} | Provider: {booking.worker} | {booking.dateTime}
              </p>
              <div className="mt-3 grid gap-2 text-xs font-bold text-gray-500 sm:grid-cols-2">
                <span>Customer Name: {booking.customerName || "Not added"}</span>
                <span>Customer Phone: {booking.customerPhone || "Not added"}</span>
                <span>Worker Phone: {booking.workerPhone || "Not added"}</span>
                <span>Area: {booking.area || "Hapur"}</span>
                <span>Price: {workerPriceLabel(booking.quotedPrice)}</span>
                <span>Provider Decision: {booking.status}</span>
                <span className="sm:col-span-2">Address: {booking.address || "Not added"}</span>
                <span className="sm:col-span-2">Details: {booking.notes || "No notes"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateBookingStatus(booking.id, "Accepted")}
                  className="rounded-xl bg-green-100 px-3 py-2 text-xs font-black text-[#15803D]"
                >
                  Provider Accepted
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(booking.id, "Rejected")}
                  className="rounded-xl bg-red-100 px-3 py-2 text-xs font-black text-red-700"
                >
                  Provider Rejected
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(booking.id, "Completed")}
                  className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-black text-[#2563EB]"
                >
                  Mark Completed
                </button>
              </div>
            </div>
            <select
              value={booking.status}
              onChange={(event) => updateBookingStatus(booking.id, event.target.value as BookingStatus)}
              className="rounded-2xl border border-gray-200 px-4 py-3 font-black outline-none focus:border-[#2563EB]"
            >
              <option value="New">New</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({
  credentials,
  setCredentials,
}: {
  credentials: AdminCredentials;
  setCredentials: StateSetter<AdminCredentials>;
}) {
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password);
  const [message, setMessage] = useState("");

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setMessage("Username and password are required.");
      return;
    }

    setCredentials({ username: username.trim(), password: password.trim() });
    setMessage("Admin settings updated.");
    window.setTimeout(() => setMessage(""), 3000);
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-xl font-black text-[#1F2937]">Settings Panel</h3>
      <div className="mt-5 space-y-4">
        <label className="block space-y-2 text-sm font-black text-[#1F2937]">
          Change Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="block space-y-2 text-sm font-black text-[#1F2937]">
          Change Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          />
        </label>
        {message ? <p className="text-sm font-bold text-[#15803D]">{message}</p> : null}
        <button className="rounded-2xl bg-[#2563EB] px-5 py-3 font-black text-white transition hover:bg-[#1E40AF]">
          Save Settings
        </button>
      </div>
    </form>
  );
}

function AdminDashboard({
  workers,
  setWorkers,
  services,
  setServices,
  bookings,
  setBookings,
  credentials,
  setCredentials,
  onClose,
}: {
  workers: Worker[];
  setWorkers: StateSetter<Worker[]>;
  services: Service[];
  setServices: StateSetter<Service[]>;
  bookings: Booking[];
  setBookings: StateSetter<Booking[]>;
  credentials: AdminCredentials;
  setCredentials: StateSetter<AdminCredentials>;
  onClose: () => void;
}) {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorageState(ADMIN_SESSION_KEY, false);
  const [activePanel, setActivePanel] = useState("overview");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const panels = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services" },
    { id: "workers", label: "Workers" },
    { id: "bookings", label: "Bookings" },
    { id: "settings", label: "Settings" },
  ];

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loginUsername === credentials.username && loginPassword === credentials.password) {
      setIsLoggedIn(true);
      setLoginError("");
      setLoginPassword("");
      return;
    }

    setLoginError("Invalid username or password.");
  }

  function renderPanel() {
    if (activePanel === "overview") {
      return <OverviewPanel workers={workers} services={services} bookings={bookings} />;
    }

    if (activePanel === "services") {
      return <ServiceManagement services={services} setServices={setServices} />;
    }

    if (activePanel === "workers") {
      return (
        <WorkerManagement
          workers={workers}
          setWorkers={setWorkers}
          services={services}
          bookings={bookings}
        />
      );
    }

    if (activePanel === "bookings") {
      return <BookingsPanel bookings={bookings} setBookings={setBookings} />;
    }

    return <SettingsPanel credentials={credentials} setCredentials={setCredentials} />;
  }

  return (
    <section className="rounded-[2rem] bg-[#F9FAFB] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#2563EB]">Secure Admin</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1F2937]">Kaamnow Dashboard</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="rounded-full border border-[#2563EB] px-5 py-3 text-sm font-black text-[#2563EB] transition hover:bg-blue-50"
              >
                Logout
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#1E3A8A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1E40AF]"
            >
              Close
            </button>
          </div>
        </div>

        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="max-w-md rounded-[2rem] bg-white p-5 shadow-xl shadow-blue-950/8 ring-1 ring-gray-100">
            <h3 className="text-2xl font-black text-[#1F2937]">Login</h3>
            <div className="mt-5 space-y-4">
              <input
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Username"
              />
              <input
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                type="password"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Password"
              />
              {loginError ? <p className="text-sm font-bold text-red-600">{loginError}</p> : null}
              <button className="w-full rounded-2xl bg-[#2563EB] px-5 py-4 font-black text-white transition hover:bg-[#1E40AF]">
                Login to Dashboard
              </button>
            </div>
          </form>
        ) : (
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-950/10 ring-1 ring-gray-100 lg:grid lg:grid-cols-[260px_1fr]">
            <aside className="bg-[#1E3A8A] p-4 text-white lg:min-h-[640px]">
              <div className="mb-5 px-2">
                <BrandMark compact />
              </div>
              <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
                {panels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => setActivePanel(panel.id)}
                    className={`shrink-0 rounded-2xl px-4 py-3 text-left text-sm font-black transition lg:w-full ${
                      activePanel === panel.id
                        ? "bg-[#FACC15] text-black"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    {panel.label}
                  </button>
                ))}
              </nav>
            </aside>
            <div className="min-h-[640px] bg-[#F9FAFB] p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {renderPanel()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [workers, setWorkers] = useLocalStorageState<Worker[]>(WORKERS_KEY, DEFAULT_WORKERS);
  const [services, setServices] = useLocalStorageState<Service[]>(SERVICES_KEY, DEFAULT_SERVICES);
  const [bookings, setBookings] = useLocalStorageState<Booking[]>(BOOKINGS_KEY, DEFAULT_BOOKINGS);
  const [credentials, setCredentials] = useLocalStorageState<AdminCredentials>(
    ADMIN_KEY,
    DEFAULT_CREDENTIALS
  );
  const [query, setQuery] = useState("");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [bookingWorker, setBookingWorker] = useState<Worker | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState("");
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const providersRef = useRef<HTMLElement | null>(null);
  const registrationRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (credentials.username === "admin" && credentials.password === "kaamnow123") {
      setCredentials(DEFAULT_CREDENTIALS);
    }
  }, [credentials, setCredentials]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker);

    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  useEffect(() => {
    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
    setIsAppInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        navigatorWithStandalone.standalone === true
    );

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallMessage("");
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setIsAppInstalled(true);
      setInstallMessage("Kaamnow desktop par app logo ke saath add ho gaya.");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isAdminOpen || bookingWorker || bookingConfirmation ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [bookingConfirmation, bookingWorker, isAdminOpen]);

  function scrollToProviders() {
    providersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToRegistration() {
    registrationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addWorker(worker: Worker) {
    setWorkers((current) => [worker, ...current]);
    setQuery(worker.service);
    window.setTimeout(scrollToProviders, 250);
  }

  function pickCategory(serviceName: string) {
    setQuery(serviceName);
    window.setTimeout(scrollToProviders, 60);
  }

  function saveBooking(booking: Booking) {
    const orderedWorker = bookingWorker;
    setBookings((current) => [booking, ...current]);
    setBookingWorker(null);

    if (orderedWorker) {
      setBookingConfirmation({ booking, worker: orderedWorker });
    } else {
      setBookingMessage("Order details dashboard ke Bookings panel me save ho gayi.");
      window.setTimeout(() => setBookingMessage(""), 4500);
    }
  }

  function cancelBooking(booking: Booking, worker: Worker) {
    const cancelMessage = `Hi ${worker.name}, please cancel my ${booking.service} booking from Kaamnow. Customer: ${booking.customerName}, Phone: ${booking.customerPhone}, Area: ${booking.area}.`;

    setBookings((current) =>
      current.map((item) => (item.id === booking.id ? { ...item, status: "Cancelled" } : item))
    );
    setBookingConfirmation(null);
    setBookingMessage("Service cancel mark ho gayi. WhatsApp par message send kar dein.");
    window.open(whatsAppLink(worker.phone, cancelMessage), "_blank", "noopener,noreferrer");
    window.setTimeout(() => setBookingMessage(""), 5000);
  }

  async function handleInstallApp() {
    if (isAppInstalled) {
      setInstallMessage("Kaamnow already desktop/app mode me installed hai.");
      return;
    }

    if (!installPrompt) {
      setInstallMessage(
        "Agar prompt na aaye to Chrome menu se 'Install Kaamnow' ya 'Add to Home Screen' choose karein."
      );
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      setInstallMessage(
        choice.outcome === "accepted"
          ? "Kaamnow desktop par app logo ke saath add ho gaya."
          : "Install cancel ho gaya. 3-line menu se dobara try kar sakte hain."
      );
    } catch {
      setInstallMessage("Install prompt open nahi hua. Browser menu se Add to Desktop try karein.");
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1F2937]">
      <Header
        query={query}
        services={services}
        workers={workers}
        onQueryChange={setQuery}
        onSearch={scrollToProviders}
        onAddProfile={scrollToRegistration}
        onInstallApp={handleInstallApp}
        installMessage={installMessage}
        onAdminOpen={() => setIsAdminOpen(true)}
      />
      <main>
        <Hero onAddProfile={scrollToRegistration} />
        <CategoryGrid services={services} onPickCategory={pickCategory} />
        <ProviderSlider
          workers={workers}
          bookings={bookings}
          query={query}
          sliderRef={providersRef}
          onBook={setBookingWorker}
          onViewBooking={(booking, worker) => setBookingConfirmation({ booking, worker })}
        />
        <AddProfileSection services={services} onAddWorker={addWorker} sectionRef={registrationRef} />
      </main>
      <AnimatePresence>
        {bookingWorker ? (
          <BookingModal
            worker={bookingWorker}
            onClose={() => setBookingWorker(null)}
            onSave={saveBooking}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {bookingConfirmation ? (
          <OrderConfirmationModal
            booking={bookingConfirmation.booking}
            worker={bookingConfirmation.worker}
            onClose={() => setBookingConfirmation(null)}
            onCancel={() => cancelBooking(bookingConfirmation.booking, bookingConfirmation.worker)}
            onFindAnother={() => {
              setBookingConfirmation(null);
              window.setTimeout(scrollToProviders, 50);
            }}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {bookingMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-4 left-4 right-4 z-[90] rounded-2xl bg-[#1E3A8A] px-4 py-3 text-center text-sm font-black text-white shadow-2xl shadow-blue-950/30 sm:left-auto sm:right-6 sm:w-96"
          >
            {bookingMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {isAdminOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 p-3 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.24 }}
              className="mx-auto max-w-6xl"
            >
              <AdminDashboard
                workers={workers}
                setWorkers={setWorkers}
                services={services}
                setServices={setServices}
                bookings={bookings}
                setBookings={setBookings}
                credentials={credentials}
                setCredentials={setCredentials}
                onClose={() => setIsAdminOpen(false)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <footer className="bg-[#1E3A8A] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark compact />
          <div className="flex flex-col gap-2 text-sm font-semibold text-blue-100 sm:text-right">
            <span>Hyperlocal services for Hapur</span>
            <a href={`tel:+${SUPPORT_PHONE}`} className="text-[#FACC15]">
              Call support: +{SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}