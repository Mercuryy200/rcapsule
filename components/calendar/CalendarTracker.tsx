"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Input,
  Textarea,
  Avatar,
  Tabs,
  Tab,
  Chip,
} from "@heroui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

const occasions = ["Casual", "Work", "Date Night", "Gym", "Event", "Lounging"];
const weathers = ["Sunny", "Cloudy", "Rainy", "Snowy", "Windy"];

type ViewMode = "month" | "week" | "day";

export default function CalendarTracker({
  outfits,
}: {
  clothes: any[];
  outfits: any[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState("");

  const [metadata, setMetadata] = useState({
    occasion: "",
    weather: "",
    temperature: "",
    location: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const getViewRange = () => {
    switch (view) {
      case "month":
        return {
          start: startOfWeek(startOfMonth(currentDate)),
          end: endOfWeek(endOfMonth(currentDate)),
          apiStart: format(startOfMonth(currentDate), "yyyy-MM-dd"),
          apiEnd: format(endOfMonth(currentDate), "yyyy-MM-dd"),
        };
      case "week":
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
          apiStart: format(startOfWeek(currentDate), "yyyy-MM-dd"),
          apiEnd: format(endOfWeek(currentDate), "yyyy-MM-dd"),
        };
      case "day":
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
          apiStart: format(currentDate, "yyyy-MM-dd"),
          apiEnd: format(currentDate, "yyyy-MM-dd"),
        };
    }
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
  };

  const handlePrev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
  };

  const getHeaderTitle = () => {
    if (view === "day") return format(currentDate, "MMMM do, yyyy");
    if (view === "week") {
      const { start, end } = getViewRange();
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "MMMM yyyy");
  };

  useEffect(() => {
    fetchLogs();
  }, [currentDate, view]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const { apiStart, apiEnd } = getViewRange();

    try {
      const res = await fetch(`/api/calendar?start=${apiStart}&end=${apiEnd}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      setLogs(await res.json());
    } catch (err) {
      setError("Failed to load calendar data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (date: Date) => {
    setIsEditing(false);
    setSelectedDate(date);
    setSelectedOutfitId("");
    setMetadata({
      occasion: "",
      weather: "",
      temperature: "",
      location: "",
      notes: "",
    });
    onOpen();
  };

  const openEditModal = (entry: any) => {
    setIsEditing(true);
    const entryDate = new Date(entry.metadata.wornAt);
    setSelectedDate(entryDate);
    setSelectedOutfitId(entry.data.id);
    setMetadata({
      occasion: entry.metadata.occasion || "",
      weather: entry.metadata.weather || "",
      temperature: entry.metadata.temperature
        ? String(entry.metadata.temperature)
        : "",
      location: entry.metadata.location || "",
      notes: entry.metadata.notes || "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!selectedOutfitId || !selectedDate) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      date: format(selectedDate, "yyyy-MM-dd"),
      outfitId: selectedOutfitId,
      ...metadata,
    };

    try {
      let res;
      if (isEditing) {
        // For editing, we need the original date from the current view
        res = await fetch("/api/calendar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalDate: format(selectedDate, "yyyy-MM-dd"),
            newDate: format(selectedDate, "yyyy-MM-dd"),
            outfitId: selectedOutfitId,
            ...metadata,
          }),
        });
      } else {
        res = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }

      fetchLogs();
      onOpenChange();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (outfitId: string, date: Date) => {
    if (
      !confirm(
        "Remove this wear log? Your outfit stats will be updated automatically.",
      )
    )
      return;

    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(
        `/api/calendar?outfitId=${outfitId}&date=${dateStr}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        fetchLogs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      alert("Failed to delete log");
    }
  };

  const getDayContent = (day: Date) => {
    const dayLogs = logs.filter((log) => isSameDay(new Date(log.wornAt), day));
    const uniqueEntries = new Map();
    dayLogs.forEach((log) => {
      if (log.outfit && !uniqueEntries.has(log.outfit.id)) {
        uniqueEntries.set(log.outfit.id, {
          type: "outfit",
          data: log.outfit,
          metadata: log,
        });
      }
    });
    return Array.from(uniqueEntries.values());
  };

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setView("day");
  };

  const renderMonthOrWeek = () => {
    const { start, end } = getViewRange();
    const days = eachDayOfInterval({ start, end });
    const isWeek = view === "week";

    if (loading) {
      return (
        <div className="flex items-center justify-center h-[500px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    return (
      <div
        className={`grid grid-cols-7 gap-px bg-default-200 border border-default-200 rounded-lg overflow-hidden ${isWeek ? "h-[500px]" : ""}`}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-default-50 p-3 text-center text-[10px] uppercase font-bold text-default-400"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const entries = getDayContent(day);

          return (
            <div
              key={day.toString()}
              className={`bg-background p-2 transition-colors hover:bg-default-50 cursor-pointer relative group flex flex-col gap-2 
                ${!isCurrentMonth && view === "month" ? "opacity-30 bg-default-50/50" : ""}
                ${isWeek ? "min-h-[450px]" : "min-h-[140px]"}
                ${isToday ? "ring-2 ring-primary ring-inset" : ""}
              `}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-xs font-bold ${isToday ? "text-primary bg-primary/10 px-2 py-0.5 rounded-full" : "text-default-500"}`}
                >
                  {format(day, "d")}
                </span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddModal(day);
                  }}
                  className="p-1.5 rounded-full hover:bg-default-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <PlusIcon className="w-4 h-4 text-default-500" />
                </div>
              </div>

              {entries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {entries.map((entry: any) => (
                    <div key={entry.data.id} className="relative group/avatar">
                      <Avatar
                        src={entry.data.imageUrl}
                        size={isWeek ? "lg" : "sm"}
                        radius="md"
                        className="border border-default-200 shadow-sm"
                      />
                      {isWeek && (
                        <div className="hidden group-hover/avatar:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-foreground text-background text-xs p-3 rounded-lg shadow-xl pointer-events-none">
                          <p className="font-bold mb-1">{entry.data.name}</p>
                          <p className="opacity-70 text-[10px] uppercase tracking-widest">
                            {entry.metadata.occasion || "No occasion"}
                          </p>
                          {entry.data.timesWorn > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-[10px] opacity-60">
                              <ClockIcon className="w-3 h-3" />
                              Worn {entry.data.timesWorn}x
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const entries = getDayContent(currentDate);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    return (
      <div className="bg-background min-h-[500px] flex flex-col gap-6 animate-in fade-in duration-300">
        <div
          className="p-10 border border-dashed border-default-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-default-50 transition-colors group"
          onClick={() => openAddModal(currentDate)}
        >
          <div className="bg-default-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <PlusIcon className="w-6 h-6 text-default-500" />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-default-400">
            Log Outfit for {format(currentDate, "MMM do")}
          </p>
        </div>

        {entries.length > 0 && (
          <div className="space-y-6">
            {entries.map((entry: any) => (
              <div
                key={entry.data.id}
                className="flex flex-col md:flex-row gap-6 p-6 border border-default-200 rounded-2xl bg-default-50/30 hover:border-default-300 transition-colors"
              >
                <div className="w-full md:w-48 h-64 bg-background rounded-xl border border-default-100 shrink-0 overflow-hidden">
                  <img
                    src={entry.data.imageUrl}
                    alt={entry.data.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Chip size="sm" color="primary" variant="dot">
                          Outfit
                        </Chip>
                        {entry.data.timesWorn > 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            startContent={<FireIcon className="w-3 h-3" />}
                          >
                            Worn {entry.data.timesWorn}x
                          </Chip>
                        )}
                      </div>
                      <h4 className="font-black text-2xl uppercase italic">
                        {entry.data.name}
                      </h4>
                      {entry.data.description && (
                        <p className="text-sm text-default-500 mt-1">
                          {entry.data.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => openEditModal(entry)}
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleDelete(entry.data.id, currentDate)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-background rounded-lg border border-default-100">
                      <p className="text-[10px] uppercase text-default-400 mb-1">
                        Occasion
                      </p>
                      <p className="font-medium text-sm">
                        {entry.metadata.occasion || "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-default-100">
                      <p className="text-[10px] uppercase text-default-400 mb-1">
                        Weather
                      </p>
                      <p className="font-medium text-sm">
                        {entry.metadata.weather || "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-default-100">
                      <p className="text-[10px] uppercase text-default-400 mb-1">
                        Temp
                      </p>
                      <p className="font-medium text-sm">
                        {entry.metadata.temperature
                          ? `${entry.metadata.temperature}°C`
                          : "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-default-100">
                      <p className="text-[10px] uppercase text-default-400 mb-1">
                        Location
                      </p>
                      <p className="font-medium text-sm">
                        {entry.metadata.location || "-"}
                      </p>
                    </div>
                  </div>

                  {entry.metadata.notes && (
                    <div className="bg-background p-4 rounded-xl border border-default-100 flex-1">
                      <p className="text-[10px] uppercase text-default-400 mb-2">
                        Notes
                      </p>
                      <p className="text-sm italic text-default-600 leading-relaxed">
                        "{entry.metadata.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background border border-default-200 rounded-xl p-6 shadow-sm">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter min-w-[200px]">
            {getHeaderTitle()}
          </h2>
          <div className="flex gap-1 bg-default-100 rounded-full p-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              onPress={handlePrev}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              onPress={handleNext}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="light"
              radius="full"
              className="px-4 font-bold text-xs"
              onPress={() => {
                setCurrentDate(new Date());
                setView("day");
              }}
            >
              Today
            </Button>
          </div>
        </div>

        <Tabs
          selectedKey={view}
          onSelectionChange={(key) => setView(key as ViewMode)}
          size="md"
          radius="full"
          color="primary"
          variant="solid"
          classNames={{
            tabList: "bg-default-100 p-1",
            cursor: "bg-background shadow-sm",
            tabContent: "group-data-[selected=true]:text-foreground font-bold",
          }}
        >
          <Tab
            key="month"
            title={
              <div className="flex items-center gap-2">
                <Squares2X2Icon className="w-4 h-4" /> Month
              </div>
            }
          />
          <Tab
            key="week"
            title={
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" /> Week
              </div>
            }
          />
          <Tab
            key="day"
            title={
              <div className="flex items-center gap-2">
                <ListBulletIcon className="w-4 h-4" /> Day
              </div>
            }
          />
        </Tabs>
      </div>

      {view === "day" ? renderDayView() : renderMonthOrWeek()}

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "h-[90vh] md:h-auto",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-default-100 py-6">
            <span className="text-xs uppercase tracking-widest text-default-400">
              {selectedDate && format(selectedDate, "EEEE, MMMM do, yyyy")}
            </span>
            <h3 className="font-black text-2xl uppercase italic">
              {isEditing ? "Modify Log" : "Log Outfit"}
            </h3>
          </ModalHeader>
          <ModalBody className="p-0">
            {error && (
              <div className="m-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-default-100 p-6 bg-default-50/50">
                <p className="text-xs font-bold uppercase tracking-widest text-default-500 mb-4">
                  Select Outfit
                </p>

                <Select
                  label="Search Wardrobe"
                  placeholder="Type to search..."
                  variant="bordered"
                  size="lg"
                  selectedKeys={selectedOutfitId ? [selectedOutfitId] : []}
                  onChange={(e) => setSelectedOutfitId(e.target.value)}
                  isDisabled={isEditing}
                  className="mb-6"
                >
                  {outfits.map((item) => (
                    <SelectItem key={item.id} textValue={item.name}>
                      <div className="flex items-center gap-3">
                        <Avatar src={item.imageUrl} size="sm" radius="sm" />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          {item.timesWorn > 0 && (
                            <p className="text-xs text-default-400">
                              Worn {item.timesWorn}x
                            </p>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                <div className="aspect-[3/4] bg-background rounded-xl border-2 border-dashed border-default-200 flex items-center justify-center overflow-hidden relative">
                  {selectedOutfitId ? (
                    <img
                      src={
                        outfits.find((i) => i.id === selectedOutfitId)?.imageUrl
                      }
                      alt="Selected outfit"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Squares2X2Icon className="w-8 h-8 text-default-300 mx-auto mb-2" />
                      <p className="text-xs text-default-400">
                        No outfit selected
                      </p>
                    </div>
                  )}

                  {selectedOutfitId && (
                    <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-lg border border-white/20">
                      <p className="font-bold text-sm truncate">
                        {outfits.find((i) => i.id === selectedOutfitId)?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-2/3 p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Occasion"
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder="Where did you go?"
                    selectedKeys={metadata.occasion ? [metadata.occasion] : []}
                    onChange={(e) =>
                      setMetadata({ ...metadata, occasion: e.target.value })
                    }
                  >
                    {occasions.map((o) => (
                      <SelectItem key={o}>{o}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Weather"
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder="What was it like?"
                    selectedKeys={metadata.weather ? [metadata.weather] : []}
                    onChange={(e) =>
                      setMetadata({ ...metadata, weather: e.target.value })
                    }
                  >
                    {weathers.map((w) => (
                      <SelectItem key={w}>{w}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Temperature (°C)"
                    type="number"
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder="22"
                    value={metadata.temperature}
                    onChange={(e) =>
                      setMetadata({ ...metadata, temperature: e.target.value })
                    }
                  />
                  <Input
                    label="Location"
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder="e.g. Downtown, Office"
                    value={metadata.location}
                    onChange={(e) =>
                      setMetadata({ ...metadata, location: e.target.value })
                    }
                  />
                </div>

                <Textarea
                  label="Daily Notes"
                  placeholder="Did you get any compliments? Was it comfortable?"
                  variant="bordered"
                  labelPlacement="outside"
                  minRows={4}
                  value={metadata.notes}
                  onChange={(e) =>
                    setMetadata({ ...metadata, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-default-100 p-6">
            <Button variant="flat" onPress={() => onOpenChange()}>
              Cancel
            </Button>
            <Button
              color="primary"
              className="font-bold uppercase tracking-widest px-8"
              isLoading={submitting}
              onPress={handleSubmit}
              isDisabled={!selectedOutfitId}
            >
              {isEditing ? "Save Changes" : "Log to Calendar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
