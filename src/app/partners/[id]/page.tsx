"use client";

import { useState, use, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle2,
  Circle,
  MapPin,
  GraduationCap,
  Users,
  AlertCircle,
  Clock,
  Building,
  Plus,
  Paperclip,
  Link as LinkIcon,
  X,
  Loader2,
  AlertTriangle,
  Pencil,
  Check,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Star,
  Trash2,
  Globe,
  Video,
  ListTodo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RichTextEditor,
  RichTextContent,
} from "@/components/ui/rich-text-editor";
import {
  statusColors,
  priorityColors,
  leadSourceColors,
  onboardingStepColors,
  partnershipHealthColors,
  renewalStatusColors,
  noteTypeColors,
  statusOrder,
  type PartnershipHealth,
  type RenewalStatus,
  type PartnerStatus,
  type Priority,
  type NoteType,
} from "@/data/partners";
import { formatDate } from "@/lib/utils";
import { usePartner } from "@/hooks/usePartners";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PartnerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    partner,
    schools,
    attachments,
    loading,
    error,
    updateOnboardingTask,
    initializeOnboardingTasks,
    updateCustomTaskText,
    updateTaskDueDate,
    addCustomTask,
    addNote,
    updatePartnershipHealth,
    updateStatus,
    updatePriority,
    updatePartnerField,
    updateLeadContact,
    addContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
    addFollowUpTask,
    updateFollowUpTask,
    deleteFollowUpTask,
    addTask,
    updateTask,
    deleteNote,
    updateNote,
    updateSchool,
    addAttachment,
    deleteAttachment,
    importantDates,
    addImportantDate,
    updateImportantDate,
    deleteImportantDate,
  } = usePartner(id);

  const { data: session, status: sessionStatus } = useSession();

  interface NextMeeting {
    summary: string;
    start: string;
    htmlLink: string;
  }

  const [nextMeeting, setNextMeeting] = useState<NextMeeting | null>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(false);

  // Fetch next meeting for this partner
  useEffect(() => {
    async function fetchMeeting() {
      if (sessionStatus !== "authenticated" || !session?.accessToken) return;
      if (!partner) return;

      // Collect all contact emails
      const emails: string[] = [];
      if (partner.leadContact?.email) {
        emails.push(partner.leadContact.email);
      }
      if (partner.contacts) {
        for (const contact of partner.contacts) {
          if (contact.email) emails.push(contact.email);
        }
      }

      if (emails.length === 0) return;

      setLoadingMeeting(true);
      try {
        const response = await fetch("/api/calendar/next-meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerEmails: { [partner.id]: emails } }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data[partner.id]) {
            setNextMeeting(data[partner.id]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch meeting:", err);
      } finally {
        setLoadingMeeting(false);
      }
    }

    fetchMeeting();
  }, [sessionStatus, session?.accessToken, partner]);

  // Helper to get local date string (avoids timezone issues with toISOString)
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("Internal Note");
  const [noteDate, setNoteDate] = useState(getLocalDateString);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [checklistExpanded, setChecklistExpanded] = useState(true);

  // Default checklist to closed for Active partners
  useEffect(() => {
    if (partner) {
      setChecklistExpanded(partner.status !== "Active");
    }
  }, [partner?.status]);
  const [taskNoteOpen, setTaskNoteOpen] = useState<number | null>(null);
  const [taskNotes, setTaskNotes] = useState<Record<number, string>>({});
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showAddAttachmentForm, setShowAddAttachmentForm] = useState(false);
  const [noteAttachments, setNoteAttachments] = useState<
    { id: string; name: string; url: string; type: "file" | "link" }[]
  >([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [addingTaskToNote, setAddingTaskToNote] = useState<string | null>(null);
  const [newFollowUpTask, setNewFollowUpTask] = useState("");
  const [newFollowUpDueDate, setNewFollowUpDueDate] = useState("");
  const [newFollowUpNotes, setNewFollowUpNotes] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showAddStandaloneTask, setShowAddStandaloneTask] = useState(false);
  const [newStandaloneTask, setNewStandaloneTask] = useState("");
  const [newStandaloneTaskDueDate, setNewStandaloneTaskDueDate] = useState("");
  const [newStandaloneTaskNotes, setNewStandaloneTaskNotes] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [editingNoteType, setEditingNoteType] =
    useState<NoteType>("Internal Note");
  const [editingNoteDate, setEditingNoteDate] = useState("");
  // Inline task for new note
  const [newNoteTask, setNewNoteTask] = useState("");
  const [newNoteTaskDueDate, setNewNoteTaskDueDate] = useState("");
  const [showNewNoteTask, setShowNewNoteTask] = useState(false);
  // Important dates
  const [showAddImportantDate, setShowAddImportantDate] = useState(false);
  const [newImportantDateTitle, setNewImportantDateTitle] = useState("");
  const [newImportantDateDate, setNewImportantDateDate] = useState("");
  const [newImportantDateNotes, setNewImportantDateNotes] = useState("");
  const [editingImportantDateId, setEditingImportantDateId] = useState<
    string | null
  >(null);
  const [editingImportantDate, setEditingImportantDate] = useState({
    title: "",
    date: "",
    notes: "",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error loading partner: {error}</p>
          <Link href="/partners" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Partners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!partner) {
    notFound();
  }

  // Combine all tasks: standalone tasks + tasks from notes
  const allTasks = [
    ...(partner.tasks || []),
    ...partner.notes.flatMap((note) =>
      (note.followUpTasks || []).map((task) => ({
        ...task,
        noteId: note.id,
        noteDate: note.date,
      })),
    ),
  ].sort((a, b) => {
    // Sort by due date (nulls last), then by completion status
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const toggleTask = async (task: { id: string; completed: boolean }) => {
    await updateOnboardingTask(task.id, !task.completed);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || isAddingNote) return;

    setIsAddingNote(true);
    try {
      const noteData = await addNote(newNote.trim(), "You", noteType, noteDate);

      // If there's an inline task, create it linked to this note
      if (newNoteTask.trim() && noteData?.id) {
        await addFollowUpTask(
          noteData.id,
          newNoteTask.trim(),
          newNoteTaskDueDate || null,
          "",
        );
      }

      // If there are attachments, save them to the partner's files
      for (const attachment of noteAttachments) {
        if (attachment.type === "link") {
          await addAttachment(attachment.name, attachment.url, "link");
        }
        // Note: file uploads would need cloud storage - for now just links work
      }

      // Reset form
      setNewNote("");
      setNoteType("Internal Note");
      setNoteDate(getLocalDateString());
      setNewNoteTask("");
      setNewNoteTaskDueDate("");
      setShowNewNoteTask(false);
      setNoteAttachments([]);
      setShowLinkForm(false);
    } catch (err) {
      console.error("Failed to add note:", err);
      alert(
        "Failed to add note: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAddFollowUpTask = async (noteId: string) => {
    if (!newFollowUpTask.trim()) return;

    try {
      await addFollowUpTask(
        noteId,
        newFollowUpTask.trim(),
        newFollowUpDueDate || null,
        newFollowUpNotes.trim(),
      );
      setNewFollowUpTask("");
      setNewFollowUpDueDate("");
      setNewFollowUpNotes("");
      setAddingTaskToNote(null);
    } catch (err) {
      console.error("Failed to add follow-up task:", err);
    }
  };

  const handleAddStandaloneTask = async () => {
    if (!newStandaloneTask.trim()) return;

    try {
      await addTask(
        newStandaloneTask.trim(),
        newStandaloneTaskDueDate || null,
        newStandaloneTaskNotes.trim(),
      );
      setNewStandaloneTask("");
      setNewStandaloneTaskDueDate("");
      setNewStandaloneTaskNotes("");
      setShowAddStandaloneTask(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const toggleNoteExpanded = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  // Handle file upload for note attachments (local state only)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        type: "file" as const,
      };
      setNoteAttachments((prev) => [...prev, attachment]);
    });

    e.target.value = "";
  };

  // Handle adding a link for note attachments (local state only)
  const handleAddNoteLink = () => {
    if (!linkUrl.trim()) return;

    const attachment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: linkName.trim() || linkUrl,
      url: linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`,
      type: "link" as const,
    };

    setNoteAttachments((prev) => [...prev, attachment]);
    setLinkUrl("");
    setLinkName("");
    setShowLinkForm(false);
  };

  // Remove a note attachment (local state only)
  const removeNoteAttachment = (attachmentId: string) => {
    setNoteAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  // Handle adding a link to the partner's Files & Links (persisted to database)
  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;

    const name = linkName.trim() || linkUrl;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;

    try {
      await addAttachment(name, url, "link");
      setLinkUrl("");
      setLinkName("");
      setShowAddAttachmentForm(false);
    } catch (err) {
      console.error("Failed to add link:", err);
      alert("Failed to add link. Please try again.");
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId);
    } catch (err) {
      console.error("Failed to remove attachment:", err);
      alert("Failed to remove attachment. Please try again.");
    }
  };

  const handleHealthChange = async (health: PartnershipHealth) => {
    try {
      await updatePartnershipHealth(health);
    } catch (err) {
      console.error("Failed to update partnership health:", err);
    }
  };

  const handleStatusChange = async (newStatus: PartnerStatus) => {
    try {
      await updatePartnerField("status", newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Check console for details.");
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    try {
      await updatePartnerField("priority", newPriority);
    } catch (err) {
      console.error("Failed to update priority:", err);
      alert("Failed to update priority. Check console for details.");
    }
  };

  const startEditing = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setEditValue(String(currentValue));
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveField = async (field: string, isNumber = false) => {
    try {
      const value = isNumber ? parseInt(editValue, 10) || 0 : editValue;
      await updatePartnerField(field, value);
      setEditingField(null);
      setEditValue("");
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }
  };

  const handleContactFieldChange = async (
    field: keyof typeof partner.leadContact,
    value: string,
  ) => {
    try {
      await updateLeadContact({
        ...partner.leadContact,
        [field]: value,
      });
    } catch (err) {
      console.error(`Failed to update contact ${field}:`, err);
    }
  };

  const completedTasks = partner.onboardingChecklist.filter(
    (t) => t.completed,
  ).length;
  const totalTasks = partner.onboardingChecklist.length;
  const progressPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/partners">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Partners
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {partner.name}
            </h1>
            <Badge className={statusColors[partner.status]}>
              {partner.status}
            </Badge>
            {partner.status === "New Lead" && partner.leadSource && (
              <Badge className={leadSourceColors[partner.leadSource]}>
                {partner.leadSource}
              </Badge>
            )}
            {partner.status === "Onboarding" && partner.onboardingStep && (
              <Badge className={onboardingStepColors[partner.onboardingStep]}>
                {partner.onboardingStep}
              </Badge>
            )}
            {partner.status === "Active" && partner.partnershipHealth ? (
              <Badge
                className={partnershipHealthColors[partner.partnershipHealth]}
              >
                {partner.partnershipHealth}
              </Badge>
            ) : (
              <Badge className={priorityColors[partner.priority]}>
                {partner.priority} Priority
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <select
                value={partner.schoolType}
                onChange={async (e) => {
                  try {
                    await updatePartnerField("schoolType", e.target.value);
                  } catch (err) {
                    console.error("Failed to update partner type:", err);
                    alert(
                      "Failed to update partner type. Check console for details.",
                    );
                  }
                }}
                className="bg-transparent border-none p-0 text-sm text-[var(--muted-foreground)] cursor-pointer hover:text-[var(--foreground)] focus:outline-none"
              >
                <option value="Public">Public</option>
                <option value="Charter">Charter</option>
                <option value="Non-Profit">Non-Profit</option>
              </select>
            </span>
            <span className="flex items-center gap-1 group">
              <GraduationCap className="h-4 w-4" />
              {editingField === "studentCount" ? (
                <span className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveField("studentCount", true);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="w-20 px-1 py-0.5 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                    autoFocus
                  />
                  <button
                    onClick={() => saveField("studentCount", true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : (
                <span
                  onClick={() =>
                    startEditing("studentCount", partner.studentCount ?? 0)
                  }
                  className="cursor-pointer hover:text-[var(--foreground)] flex items-center gap-1"
                >
                  {(partner.studentCount ?? 0).toLocaleString()} students
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 group">
              <Users className="h-4 w-4" />
              {editingField === "staffCount" ? (
                <span className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveField("staffCount", true);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="w-16 px-1 py-0.5 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                    autoFocus
                  />
                  <button
                    onClick={() => saveField("staffCount", true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : (
                <span
                  onClick={() =>
                    startEditing("staffCount", partner.staffCount ?? 0)
                  }
                  className="cursor-pointer hover:text-[var(--foreground)] flex items-center gap-1"
                >
                  {partner.staffCount ?? 0} staff
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 group">
              <Building className="h-4 w-4" />
              {editingField === "schoolCount" ? (
                <span className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveField("schoolCount", true);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="w-16 px-1 py-0.5 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                    autoFocus
                  />
                  <button
                    onClick={() => saveField("schoolCount", true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : (
                <span
                  onClick={() =>
                    startEditing("schoolCount", partner.schoolCount ?? 1)
                  }
                  className="cursor-pointer hover:text-[var(--foreground)] flex items-center gap-1"
                >
                  {partner.schoolCount ?? 1}{" "}
                  {(partner.schoolCount ?? 1) === 1 ? "school" : "schools"}
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                </span>
              )}
            </span>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Partner
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {editingField === "summary" ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full min-h-[120px] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-relaxed text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => saveField("summary")}>
                      <Check className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  onClick={() => startEditing("summary", partner.summary)}
                  className="text-[var(--muted-foreground)] leading-relaxed cursor-pointer hover:bg-[var(--muted)] rounded-md p-2 -m-2 transition-colors group"
                >
                  {partner.summary || "Click to add engagement summary..."}
                  <Pencil className="inline-block ml-2 h-3 w-3 opacity-0 group-hover:opacity-50" />
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pain Points & Needs</CardTitle>
            </CardHeader>
            <CardContent>
              {editingField === "painPoints" ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter each pain point on a new line..."
                    className="w-full min-h-[150px] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-relaxed text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] resize-none"
                    autoFocus
                  />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Enter each pain point on a separate line
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        const painPointsArray = editValue
                          .split("\n")
                          .map((p) => p.trim())
                          .filter((p) => p.length > 0);
                        await updatePartnerField("painPoints", painPointsArray);
                        cancelEditing();
                      }}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() =>
                    startEditing("painPoints", partner.painPoints.join("\n"))
                  }
                  className="cursor-pointer hover:bg-[var(--muted)] rounded-md p-2 -m-2 transition-colors group"
                >
                  {partner.painPoints.length > 0 ? (
                    <ul className="space-y-2">
                      {partner.painPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-[var(--muted-foreground)]">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[var(--muted-foreground)]">
                      Click to add pain points...
                    </p>
                  )}
                  <Pencil className="inline-block ml-2 h-3 w-3 opacity-0 group-hover:opacity-50 mt-2" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Dates & Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                    <Clock className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Last Contact
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatDate(partner.lastContactDate)}
                    </p>
                  </div>
                </div>
                {partner.nextFollowUp && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Next Follow-up
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDate(partner.nextFollowUp)}
                      </p>
                    </div>
                  </div>
                )}
                {partner.proposalDeadline && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Proposal Deadline
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDate(partner.proposalDeadline)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Contract
                    </p>
                    <a
                      href={partner.contractLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-700 hover:underline"
                    >
                      View Contract
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setChecklistExpanded(!checklistExpanded)}
                  className="flex items-center gap-2 hover:text-slate-700 transition-colors"
                >
                  {checklistExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <CardTitle>Onboarding Checklist</CardTitle>
                </button>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {completedTasks} of {totalTasks} completed
                </span>
              </div>
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                  <div
                    className="h-2 rounded-full bg-slate-700 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            {checklistExpanded && (
              <CardContent>
                {partner.onboardingChecklist.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-[var(--muted-foreground)] mb-3">
                      No onboarding tasks yet.
                    </p>
                    <Button
                      onClick={async () => {
                        try {
                          await initializeOnboardingTasks();
                        } catch (err) {
                          console.error("Failed to initialize tasks:", err);
                          alert(
                            "Failed to initialize tasks. Check console for details.",
                          );
                        }
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Initialize Onboarding Tasks
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {partner.onboardingChecklist.map((task, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center gap-2">
                          {/* Custom task being edited */}
                          {task.isCustom && editingTaskIndex === index ? (
                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-400 p-4 bg-slate-50">
                              <Circle className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
                              <input
                                type="text"
                                value={editingTaskText}
                                onChange={(e) =>
                                  setEditingTaskText(e.target.value)
                                }
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    await updateCustomTaskText(
                                      index,
                                      editingTaskText,
                                    );
                                    setEditingTaskIndex(null);
                                    setEditingTaskText("");
                                  }
                                  if (e.key === "Escape") {
                                    setEditingTaskIndex(null);
                                    setEditingTaskText("");
                                  }
                                }}
                                placeholder="Enter custom task..."
                                className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                                autoFocus
                              />
                              <button
                                onClick={async () => {
                                  await updateCustomTaskText(
                                    index,
                                    editingTaskText,
                                  );
                                  setEditingTaskIndex(null);
                                  setEditingTaskText("");
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingTaskIndex(null);
                                  setEditingTaskText("");
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (task.isCustom && !task.task) {
                                  // Empty custom task - start editing
                                  setEditingTaskIndex(index);
                                  setEditingTaskText(task.task);
                                } else {
                                  // Toggle completion
                                  toggleTask(task);
                                }
                              }}
                              className={`flex flex-1 items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-[var(--muted)] ${
                                task.isCustom
                                  ? "border-dashed border-[var(--border)]"
                                  : "border-[var(--border)]"
                              }`}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
                              )}
                              <span
                                className={
                                  task.completed
                                    ? "text-[var(--muted-foreground)] line-through"
                                    : task.isCustom && !task.task
                                      ? "text-[var(--muted-foreground)] italic"
                                      : "text-[var(--foreground)]"
                                }
                              >
                                {task.task ||
                                  (task.isCustom
                                    ? "Click to add custom task..."
                                    : "")}
                              </span>
                            </button>
                          )}
                          {/* Edit button for custom tasks with content */}
                          {task.isCustom &&
                            task.task &&
                            editingTaskIndex !== index && (
                              <button
                                onClick={() => {
                                  setEditingTaskIndex(index);
                                  setEditingTaskText(task.task);
                                }}
                                className="p-2 rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                                title="Edit task"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                            )}
                          {/* Due date picker */}
                          {editingTaskIndex !== index && (
                            <div className="relative">
                              <input
                                type="date"
                                value={task.dueDate || ""}
                                onChange={async (e) => {
                                  await updateTaskDueDate(
                                    index,
                                    e.target.value || null,
                                  );
                                }}
                                className={`h-10 px-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm transition-colors hover:bg-[var(--muted)] cursor-pointer ${
                                  task.dueDate
                                    ? "text-[var(--foreground)]"
                                    : "text-[var(--muted-foreground)]"
                                }`}
                                title="Set due date"
                              />
                            </div>
                          )}
                          {/* Note button */}
                          {editingTaskIndex !== index && (
                            <button
                              onClick={() =>
                                setTaskNoteOpen(
                                  taskNoteOpen === index ? null : index,
                                )
                              }
                              className={`p-2 rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--muted)] ${
                                taskNotes[index]
                                  ? "text-slate-700"
                                  : "text-[var(--muted-foreground)]"
                              }`}
                              title="Add note"
                            >
                              <MessageSquare className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        {taskNoteOpen === index && (
                          <div className="mt-2 p-3 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
                            <textarea
                              value={taskNotes[index] || ""}
                              onChange={(e) =>
                                setTaskNotes((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }))
                              }
                              placeholder="Add a note for this task..."
                              className="w-full min-h-[80px] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] resize-none"
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setTaskNoteOpen(null)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Task Button/Form */}
                    {showAddTask ? (
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-400 p-4 bg-slate-50">
                        <Plus className="h-5 w-5 text-slate-700 shrink-0" />
                        <input
                          type="text"
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && newTaskText.trim()) {
                              await addCustomTask(newTaskText.trim());
                              setNewTaskText("");
                              setShowAddTask(false);
                            }
                            if (e.key === "Escape") {
                              setNewTaskText("");
                              setShowAddTask(false);
                            }
                          }}
                          placeholder="Enter task name..."
                          className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            if (newTaskText.trim()) {
                              await addCustomTask(newTaskText.trim());
                              setNewTaskText("");
                              setShowAddTask(false);
                            }
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setNewTaskText("");
                            setShowAddTask(false);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddTask(true)}
                        className="flex items-center gap-2 w-full rounded-lg border border-dashed border-[var(--border)] p-4 text-left text-[var(--muted-foreground)] hover:border-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add custom task</span>
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as NoteType)}
                      className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    >
                      <option value="Call">Call</option>
                      <option value="Email">Email</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Internal Note">Internal Note</option>
                    </select>
                    <input
                      type="date"
                      value={noteDate}
                      onChange={(e) => setNoteDate(e.target.value)}
                      className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    />
                  </div>
                  <RichTextEditor
                    content={newNote}
                    onChange={setNewNote}
                    placeholder="Add a note about this partner..."
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowNewNoteTask(!showNewNoteTask)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          showNewNoteTask || newNoteTask
                            ? "text-slate-700"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <ListTodo className="h-4 w-4" />
                        <span>Add task</span>
                      </button>
                      <button
                        onClick={() => setShowLinkForm(!showLinkForm)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          showLinkForm || noteAttachments.length > 0
                            ? "text-slate-700"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>Add link</span>
                      </button>
                    </div>
                    <Button
                      onClick={handleAddNote}
                      size="sm"
                      disabled={isAddingNote}
                    >
                      {isAddingNote ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-1 h-4 w-4" />
                      )}
                      Add Note
                    </Button>
                  </div>

                  {showNewNoteTask && (
                    <div className="flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <Input
                          value={newNoteTask}
                          onChange={(e) => setNewNoteTask(e.target.value)}
                          placeholder="Task description..."
                          className="w-full"
                        />
                      </div>
                      <input
                        type="date"
                        value={newNoteTaskDueDate}
                        onChange={(e) => setNewNoteTaskDueDate(e.target.value)}
                        className="h-9 px-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm shrink-0"
                      />
                      <Button
                        onClick={() => {
                          setShowNewNoteTask(false);
                        }}
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {newNoteTask && !showNewNoteTask && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
                      <ListTodo className="h-4 w-4 text-blue-600" />
                      <span className="flex-1 text-blue-800">
                        {newNoteTask}
                      </span>
                      {newNoteTaskDueDate && (
                        <span className="text-blue-600 text-xs">
                          Due: {newNoteTaskDueDate}
                        </span>
                      )}
                      <button
                        onClick={() => setShowNewNoteTask(true)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setNewNoteTask("");
                          setNewNoteTaskDueDate("");
                        }}
                        className="text-blue-600 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {showLinkForm && (
                    <div className="flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg">
                      <Input
                        value={linkName}
                        onChange={(e) => setLinkName(e.target.value)}
                        placeholder="Link name (optional)"
                        className="flex-1"
                      />
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button onClick={handleAddNoteLink} size="sm">
                        Add
                      </Button>
                      <Button
                        onClick={() => setShowLinkForm(false)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {noteAttachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Attachments
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {noteAttachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)] rounded-md text-sm"
                          >
                            {attachment.type === "file" ? (
                              <Paperclip className="h-3 w-3 text-[var(--muted-foreground)]" />
                            ) : (
                              <LinkIcon className="h-3 w-3 text-[var(--muted-foreground)]" />
                            )}
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-700 hover:underline"
                            >
                              {attachment.name}
                            </a>
                            <button
                              onClick={() =>
                                removeNoteAttachment(attachment.id)
                              }
                              className="text-[var(--muted-foreground)] hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--border)] pt-4 space-y-4">
                  {partner.notes.length === 0 ? (
                    <p className="text-center text-[var(--muted-foreground)] py-4">
                      No notes yet
                    </p>
                  ) : (
                    partner.notes.map((note) => (
                      <div
                        key={note.id}
                        className="border-l-2 border-slate-200 pl-4"
                      >
                        {editingNoteId === note.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <select
                                value={editingNoteType}
                                onChange={(e) =>
                                  setEditingNoteType(e.target.value as NoteType)
                                }
                                className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                              >
                                <option value="Call">Call</option>
                                <option value="Email">Email</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Site Visit">Site Visit</option>
                                <option value="Internal Note">
                                  Internal Note
                                </option>
                              </select>
                              <input
                                type="date"
                                value={editingNoteDate}
                                onChange={(e) =>
                                  setEditingNoteDate(e.target.value)
                                }
                                className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                              />
                            </div>
                            <RichTextEditor
                              content={editingNoteContent}
                              onChange={setEditingNoteContent}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await updateNote(note.id, {
                                    content: editingNoteContent,
                                    type: editingNoteType,
                                    date: editingNoteDate,
                                  });
                                  setEditingNoteId(null);
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingNoteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                <Badge className={noteTypeColors[note.type]}>
                                  {note.type}
                                </Badge>
                                <span className="font-medium text-[var(--foreground)]">
                                  {note.author}
                                </span>
                                <span className="text-[var(--muted-foreground)]">
                                  •
                                </span>
                                <span className="text-[var(--muted-foreground)]">
                                  {formatDate(note.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteContent(note.content);
                                    setEditingNoteType(note.type);
                                    setEditingNoteDate(note.date);
                                  }}
                                  className="text-[var(--muted-foreground)] hover:text-slate-700 p-1"
                                  title="Edit note"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to delete this note?",
                                      )
                                    ) {
                                      deleteNote(note.id);
                                    }
                                  }}
                                  className="text-[var(--muted-foreground)] hover:text-red-500 p-1"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <RichTextContent
                              content={note.content}
                              className="mt-1"
                            />
                          </>
                        )}

                        {/* Follow-up Tasks Section */}
                        <div className="mt-3">
                          {note.followUpTasks &&
                            note.followUpTasks.length > 0 && (
                              <div className="space-y-2 mb-2">
                                <p className="text-xs font-medium text-[var(--foreground)]">
                                  Follow-up Tasks
                                </p>
                                {note.followUpTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-start gap-2 text-sm bg-[var(--muted)] p-2 rounded-md"
                                  >
                                    <button
                                      onClick={() =>
                                        updateFollowUpTask(task.id, {
                                          completed: !task.completed,
                                        })
                                      }
                                      className="mt-0.5"
                                    >
                                      {task.completed ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-[var(--muted-foreground)]" />
                                      )}
                                    </button>
                                    <div className="flex-1">
                                      <p
                                        className={
                                          task.completed
                                            ? "line-through text-[var(--muted-foreground)]"
                                            : "text-[var(--foreground)]"
                                        }
                                      >
                                        {task.task}
                                      </p>
                                      {task.dueDate && (
                                        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                                          <Calendar className="h-3 w-3" />
                                          Due: {formatDate(task.dueDate)}
                                        </p>
                                      )}
                                      {task.notes && (
                                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                          {task.notes}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        deleteFollowUpTask(task.id)
                                      }
                                      className="text-[var(--muted-foreground)] hover:text-red-500"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                          {addingTaskToNote === note.id ? (
                            <div className="space-y-2 p-2 bg-[var(--muted)] rounded-md">
                              <Input
                                value={newFollowUpTask}
                                onChange={(e) =>
                                  setNewFollowUpTask(e.target.value)
                                }
                                placeholder="Task description..."
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={newFollowUpDueDate}
                                  onChange={(e) =>
                                    setNewFollowUpDueDate(e.target.value)
                                  }
                                  className="text-sm flex-1"
                                />
                                <Input
                                  value={newFollowUpNotes}
                                  onChange={(e) =>
                                    setNewFollowUpNotes(e.target.value)
                                  }
                                  placeholder="Notes (optional)"
                                  className="text-sm flex-1"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddFollowUpTask(note.id)}
                                >
                                  Add Task
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setAddingTaskToNote(null);
                                    setNewFollowUpTask("");
                                    setNewFollowUpDueDate("");
                                    setNewFollowUpNotes("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingTaskToNote(note.id)}
                              className="text-xs text-slate-700 hover:underline flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add follow-up task
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setShowAddStandaloneTask(!showAddStandaloneTask)
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddStandaloneTask && (
                <div className="space-y-2 p-3 bg-[var(--muted)] rounded-md mb-4">
                  <Input
                    value={newStandaloneTask}
                    onChange={(e) => setNewStandaloneTask(e.target.value)}
                    placeholder="Task description..."
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={newStandaloneTaskDueDate}
                      onChange={(e) =>
                        setNewStandaloneTaskDueDate(e.target.value)
                      }
                      className="text-sm flex-1"
                    />
                    <Input
                      value={newStandaloneTaskNotes}
                      onChange={(e) =>
                        setNewStandaloneTaskNotes(e.target.value)
                      }
                      placeholder="Notes (optional)"
                      className="text-sm flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddStandaloneTask}>
                      Add Task
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddStandaloneTask(false);
                        setNewStandaloneTask("");
                        setNewStandaloneTaskDueDate("");
                        setNewStandaloneTaskNotes("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {allTasks.length === 0 && !showAddStandaloneTask ? (
                <p className="text-center text-[var(--muted-foreground)] py-4">
                  No tasks yet
                </p>
              ) : (
                <div className="space-y-2">
                  {allTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-3 bg-[var(--muted)] rounded-md"
                    >
                      <button
                        onClick={() =>
                          "noteId" in task
                            ? updateFollowUpTask(task.id, {
                                completed: !task.completed,
                              })
                            : updateTask(task.id, {
                                completed: !task.completed,
                              })
                        }
                        className="mt-0.5"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p
                          className={
                            task.completed
                              ? "line-through text-[var(--muted-foreground)]"
                              : "text-[var(--foreground)]"
                          }
                        >
                          {task.task}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.dueDate && (
                            <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              Due: {formatDate(task.dueDate)}
                            </p>
                          )}
                          {"noteId" in task && (
                            <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                              <MessageSquare className="h-3 w-3" />
                              From note (
                              {formatDate(
                                (task as unknown as { noteDate: string })
                                  .noteDate,
                              )}
                              )
                            </p>
                          )}
                        </div>
                        {task.notes && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {task.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteFollowUpTask(task.id)}
                        className="text-[var(--muted-foreground)] hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={partner.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as PartnerStatus)
                }
                className={`w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium ${statusColors[partner.status]}`}
              >
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Next Meeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Next Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMeeting ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
                </div>
              ) : nextMeeting ? (
                <a
                  href={nextMeeting.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-[var(--muted)] rounded-lg p-2 -m-2 transition-colors"
                >
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {nextMeeting.summary}
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(nextMeeting.start).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(nextMeeting.start).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </a>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No upcoming meetings
                </p>
              )}
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Important Dates
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddImportantDate(!showAddImportantDate)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddImportantDate && (
                <div className="space-y-2 p-3 bg-[var(--muted)] rounded-md mb-3">
                  <Input
                    value={newImportantDateTitle}
                    onChange={(e) => setNewImportantDateTitle(e.target.value)}
                    placeholder="Event title (e.g., First Day of School)"
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={newImportantDateDate}
                    onChange={(e) => setNewImportantDateDate(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    value={newImportantDateNotes}
                    onChange={(e) => setNewImportantDateNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (
                          newImportantDateTitle.trim() &&
                          newImportantDateDate
                        ) {
                          await addImportantDate(
                            newImportantDateTitle.trim(),
                            newImportantDateDate,
                            newImportantDateNotes.trim() || undefined,
                          );
                          setNewImportantDateTitle("");
                          setNewImportantDateDate("");
                          setNewImportantDateNotes("");
                          setShowAddImportantDate(false);
                        }
                      }}
                    >
                      Add Date
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddImportantDate(false);
                        setNewImportantDateTitle("");
                        setNewImportantDateDate("");
                        setNewImportantDateNotes("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {importantDates.length === 0 && !showAddImportantDate ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No important dates yet
                </p>
              ) : (
                <div className="space-y-2">
                  {importantDates.map((importantDate) => {
                    const dateObj = new Date(importantDate.date + "T00:00:00");
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = dateObj < today;
                    const isToday = dateObj.getTime() === today.getTime();
                    const isUpcoming =
                      !isPast &&
                      !isToday &&
                      dateObj.getTime() - today.getTime() <
                        7 * 24 * 60 * 60 * 1000;

                    if (editingImportantDateId === importantDate.id) {
                      return (
                        <div
                          key={importantDate.id}
                          className="p-2 bg-[var(--muted)] rounded-md space-y-2"
                        >
                          <Input
                            value={editingImportantDate.title}
                            onChange={(e) =>
                              setEditingImportantDate((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                          <Input
                            type="date"
                            value={editingImportantDate.date}
                            onChange={(e) =>
                              setEditingImportantDate((prev) => ({
                                ...prev,
                                date: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                          <Input
                            value={editingImportantDate.notes}
                            onChange={(e) =>
                              setEditingImportantDate((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            placeholder="Notes (optional)"
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                await updateImportantDate(importantDate.id, {
                                  title: editingImportantDate.title,
                                  date: editingImportantDate.date,
                                  notes:
                                    editingImportantDate.notes || undefined,
                                });
                                setEditingImportantDateId(null);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingImportantDateId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={importantDate.id}
                        className={`flex items-start justify-between p-2 rounded-md ${
                          isPast
                            ? "bg-gray-50 opacity-60"
                            : isToday
                              ? "bg-green-50 border border-green-200"
                              : isUpcoming
                                ? "bg-blue-50"
                                : "bg-[var(--muted)]"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${isPast ? "text-gray-500" : "text-[var(--foreground)]"}`}
                          >
                            {importantDate.title}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              isToday
                                ? "text-green-600 font-medium"
                                : isUpcoming
                                  ? "text-blue-600"
                                  : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {isToday
                              ? "Today"
                              : dateObj.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year:
                                    dateObj.getFullYear() !==
                                    new Date().getFullYear()
                                      ? "numeric"
                                      : undefined,
                                })}
                          </p>
                          {importantDate.notes && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                              {importantDate.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => {
                              setEditingImportantDateId(importantDate.id);
                              setEditingImportantDate({
                                title: importantDate.title,
                                date: importantDate.date,
                                notes: importantDate.notes || "",
                              });
                            }}
                            className="p-1 text-[var(--muted-foreground)] hover:text-slate-700"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() =>
                              deleteImportantDate(importantDate.id)
                            }
                            className="p-1 text-[var(--muted-foreground)] hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {partner.status !== "Active" && (
            <Card>
              <CardHeader>
                <CardTitle>Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={partner.priority}
                  onChange={(e) =>
                    handlePriorityChange(e.target.value as Priority)
                  }
                  className={`w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium ${priorityColors[partner.priority]}`}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </CardContent>
            </Card>
          )}

          {partner.status === "Active" && (
            <Card>
              <CardHeader>
                <CardTitle>Partnership Health</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={partner.partnershipHealth || "Monitoring (New)"}
                  onChange={(e) =>
                    handleHealthChange(e.target.value as PartnershipHealth)
                  }
                  className={`w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium ${partnershipHealthColors[partner.partnershipHealth || "Monitoring (New)"]}`}
                >
                  <option value="Thriving">Thriving</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Watch">Watch</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Monitoring (New)">Monitoring (New)</option>
                </select>
              </CardContent>
            </Card>
          )}

          {partner.status === "Active" && (
            <Card>
              <CardHeader>
                <CardTitle>2026-27 Renewal</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={partner.renewalStatus || "Not Yet Determined"}
                  onChange={(e) =>
                    updatePartnerField("renewalStatus", e.target.value)
                  }
                  className={`w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium ${renewalStatusColors[(partner.renewalStatus as RenewalStatus) || "Not Yet Determined"]}`}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Not Renewing">Not Renewing</option>
                  <option value="Not Yet Determined">Not Yet Determined</option>
                </select>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Partner Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Contact */}
              {(partner.contacts || [])
                .filter((c) => c.isPrimary)
                .map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-slate-700" />
                        Primary Contact
                      </span>
                    </div>
                    <div className="group">
                      <p
                        onClick={() =>
                          startEditing(
                            `contact-${contact.id}-name`,
                            contact.name,
                          )
                        }
                        className="font-medium text-[var(--foreground)] cursor-pointer hover:text-slate-700 flex items-center gap-1"
                      >
                        {editingField === `contact-${contact.id}-name` ? (
                          <span className="flex items-center gap-1 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === "Enter") {
                                  await updateContact(contact.id, {
                                    ...contact,
                                    name: editValue,
                                  });
                                  cancelEditing();
                                }
                                if (e.key === "Escape") cancelEditing();
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                              autoFocus
                            />
                            <button
                              onClick={async () => {
                                await updateContact(contact.id, {
                                  ...contact,
                                  name: editValue,
                                });
                                cancelEditing();
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </span>
                        ) : (
                          <>
                            {contact.name || "Click to add name"}
                            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                          </>
                        )}
                      </p>
                    </div>
                    <div className="group mt-0.5">
                      <span
                        onClick={() =>
                          startEditing(
                            `contact-${contact.id}-role`,
                            contact.role || "",
                          )
                        }
                        className="text-sm text-[var(--muted-foreground)] cursor-pointer hover:text-slate-700 flex items-center gap-1"
                      >
                        {editingField === `contact-${contact.id}-role` ? (
                          <span className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === "Enter") {
                                  await updateContact(contact.id, {
                                    ...contact,
                                    role: editValue,
                                  });
                                  cancelEditing();
                                }
                                if (e.key === "Escape") cancelEditing();
                              }}
                              placeholder="Add role..."
                              className="px-2 py-0.5 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                              autoFocus
                            />
                            <button
                              onClick={async () => {
                                await updateContact(contact.id, {
                                  ...contact,
                                  role: editValue,
                                });
                                cancelEditing();
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ) : (
                          <>
                            {contact.role || "Click to add role"}
                            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-[var(--muted-foreground)]">
                      <Mail className="h-3 w-3" />
                      <span
                        onClick={() =>
                          startEditing(
                            `contact-${contact.id}-email`,
                            contact.email,
                          )
                        }
                        className="cursor-pointer hover:text-slate-700"
                      >
                        {editingField === `contact-${contact.id}-email` ? (
                          <span className="flex items-center gap-1">
                            <input
                              type="email"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === "Enter") {
                                  await updateContact(contact.id, {
                                    ...contact,
                                    email: editValue,
                                  });
                                  cancelEditing();
                                }
                                if (e.key === "Escape") cancelEditing();
                              }}
                              className="px-2 py-0.5 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                              autoFocus
                            />
                            <button
                              onClick={async () => {
                                await updateContact(contact.id, {
                                  ...contact,
                                  email: editValue,
                                });
                                cancelEditing();
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </span>
                        ) : (
                          contact.email || "Add email"
                        )}
                      </span>
                    </div>
                  </div>
                ))}

              {/* No primary contact message */}
              {(partner.contacts || []).filter((c) => c.isPrimary).length ===
                0 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No primary contact set
                  </p>
                </div>
              )}

              {/* City & State */}
              <div className="group">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    City & State
                  </p>
                </div>
                {editingField === "cityState" ? (
                  <div className="flex items-center gap-1 mt-1 ml-6">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveField("cityState");
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                      placeholder="e.g., San Francisco, CA"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField("cityState")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() =>
                      startEditing("cityState", partner.cityState || "")
                    }
                    className="text-sm text-[var(--muted-foreground)] cursor-pointer hover:text-[var(--foreground)] ml-6 mt-1 flex items-center gap-1"
                  >
                    {partner.cityState || "Click to add"}
                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                  </p>
                )}
              </div>

              {/* Time Zone */}
              <div className="group">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Time Zone
                  </p>
                </div>
                {editingField === "timeZone" ? (
                  <div className="flex items-center gap-1 mt-1 ml-6">
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)]"
                      autoFocus
                    >
                      <option value="">Select time zone...</option>
                      <option value="Pacific">Pacific (PT)</option>
                      <option value="Mountain">Mountain (MT)</option>
                      <option value="Central">Central (CT)</option>
                      <option value="Eastern">Eastern (ET)</option>
                    </select>
                    <button
                      onClick={() => saveField("timeZone")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() =>
                      startEditing("timeZone", partner.timeZone || "")
                    }
                    className="text-sm text-[var(--muted-foreground)] cursor-pointer hover:text-[var(--foreground)] ml-6 mt-1 flex items-center gap-1"
                  >
                    {partner.timeZone || "Click to add"}
                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                  </p>
                )}
              </div>

              {/* Additional Contacts */}
              {(partner.contacts || []).filter((c) => !c.isPrimary).length >
                0 && (
                <div className="border-t border-[var(--border)] pt-4 mt-4">
                  <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                    Other Contacts
                  </p>
                  <div className="space-y-2">
                    {(partner.contacts || [])
                      .filter((c) => !c.isPrimary)
                      .map((contact) => (
                        <div key={contact.id}>
                          {editingContactId === contact.id ? (
                            <div className="p-3 bg-slate-50 rounded-md border border-indigo-200 space-y-2">
                              <Input
                                value={editingContact.name}
                                onChange={(e) =>
                                  setEditingContact((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Name"
                                className="text-sm"
                              />
                              <Input
                                value={editingContact.role}
                                onChange={(e) =>
                                  setEditingContact((prev) => ({
                                    ...prev,
                                    role: e.target.value,
                                  }))
                                }
                                placeholder="Role"
                                className="text-sm"
                              />
                              <Input
                                value={editingContact.email}
                                onChange={(e) =>
                                  setEditingContact((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="Email"
                                type="email"
                                className="text-sm"
                              />
                              <Input
                                value={editingContact.phone}
                                onChange={(e) =>
                                  setEditingContact((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="Phone"
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    await updateContact(
                                      contact.id,
                                      editingContact,
                                    );
                                    setEditingContactId(null);
                                  }}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingContactId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2 bg-[var(--muted)] rounded-md">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                  {contact.name}
                                </p>
                                {contact.role && (
                                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                                    {contact.role}
                                  </p>
                                )}
                                <p className="text-xs text-[var(--muted-foreground)] truncate">
                                  {contact.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingContactId(contact.id);
                                    setEditingContact({
                                      name: contact.name,
                                      role: contact.role || "",
                                      email: contact.email,
                                      phone: contact.phone || "",
                                    });
                                  }}
                                  className="p-1 text-[var(--muted-foreground)] hover:text-slate-700"
                                  title="Edit contact"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await setPrimaryContact(contact.id);
                                    } catch (err) {
                                      console.error(
                                        "Failed to set primary contact:",
                                        err,
                                      );
                                      alert(
                                        "Failed to set primary contact. Check console for details.",
                                      );
                                    }
                                  }}
                                  className="p-1 text-[var(--muted-foreground)] hover:text-amber-500"
                                  title="Set as primary"
                                >
                                  <Star className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteContact(contact.id)}
                                  className="p-1 text-[var(--muted-foreground)] hover:text-red-500"
                                  title="Delete contact"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Add Contact */}
              {showAddContact ? (
                <div className="border-t border-[var(--border)] pt-4 mt-4 space-y-2">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Add Contact
                  </p>
                  <Input
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Name"
                    className="text-sm"
                  />
                  <Input
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Email"
                    type="email"
                    className="text-sm"
                  />
                  <Input
                    value={newContact.role}
                    onChange={(e) =>
                      setNewContact((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    placeholder="Role (optional)"
                    className="text-sm"
                  />
                  <Input
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Phone (optional)"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (newContact.name && newContact.email) {
                          await addContact(newContact);
                          setNewContact({
                            name: "",
                            role: "",
                            email: "",
                            phone: "",
                          });
                          setShowAddContact(false);
                        }
                      }}
                      disabled={!newContact.name || !newContact.email}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddContact(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddContact(true)}
                  className="flex items-center gap-1 text-sm text-slate-700 hover:text-slate-800 mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Add contact
                </button>
              )}
            </CardContent>
          </Card>

          {/* Schools Section - show when partner has multiple schools */}
          {((partner.schoolCount ?? 1) > 1 || schools.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Schools ({schools.length || partner.schoolCount || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schools.length > 0 ? (
                  <div className="space-y-3">
                    {schools.map((school) => (
                      <div
                        key={school.id}
                        className="p-3 bg-[var(--muted)] rounded-lg border border-[var(--border)]"
                      >
                        <p className="font-medium text-[var(--foreground)]">
                          {school.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1 group">
                            <GraduationCap className="h-3 w-3" />
                            {editingField === `school-${school.id}-students` ? (
                              <span className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      await updateSchool(school.id, {
                                        studentCount: parseInt(editValue) || 0,
                                      });
                                      cancelEditing();
                                    }
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  onBlur={async () => {
                                    await updateSchool(school.id, {
                                      studentCount: parseInt(editValue) || 0,
                                    });
                                    cancelEditing();
                                  }}
                                  className="w-16 px-1 py-0.5 text-xs border border-[var(--border)] rounded bg-[var(--background)]"
                                  autoFocus
                                />
                              </span>
                            ) : (
                              <span
                                onClick={() =>
                                  startEditing(
                                    `school-${school.id}-students`,
                                    school.studentCount.toString(),
                                  )
                                }
                                className="cursor-pointer hover:text-[var(--foreground)] flex items-center gap-1"
                              >
                                {school.studentCount.toLocaleString()} students
                                <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50" />
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 group">
                            <Users className="h-3 w-3" />
                            {editingField === `school-${school.id}-staff` ? (
                              <span className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      await updateSchool(school.id, {
                                        staffCount: parseInt(editValue) || 0,
                                      });
                                      cancelEditing();
                                    }
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  onBlur={async () => {
                                    await updateSchool(school.id, {
                                      staffCount: parseInt(editValue) || 0,
                                    });
                                    cancelEditing();
                                  }}
                                  className="w-12 px-1 py-0.5 text-xs border border-[var(--border)] rounded bg-[var(--background)]"
                                  autoFocus
                                />
                              </span>
                            ) : (
                              <span
                                onClick={() =>
                                  startEditing(
                                    `school-${school.id}-staff`,
                                    school.staffCount.toString(),
                                  )
                                }
                                className="cursor-pointer hover:text-[var(--foreground)] flex items-center gap-1"
                              >
                                {school.staffCount} staff
                                <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50" />
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 group">
                            <Building className="h-3 w-3" />
                            <select
                              value={school.schoolType || partner.schoolType}
                              onChange={(e) =>
                                updateSchool(school.id, {
                                  schoolType: e.target.value,
                                })
                              }
                              className="bg-transparent border-none p-0 text-xs text-[var(--muted-foreground)] cursor-pointer hover:text-[var(--foreground)] focus:outline-none"
                            >
                              <option value="Public">Public</option>
                              <option value="Charter">Charter</option>
                              <option value="Non-Profit">Non-Profit</option>
                            </select>
                          </span>
                        </div>
                        {school.address && (
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {school.address}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No schools added yet. Add schools to the schools database
                    with this partner&apos;s ID.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Willow Staff Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <User className="h-6 w-6 text-slate-700" />
                </div>
                <div className="flex-1">
                  <select
                    value={partner.willowStaffLead || ""}
                    onChange={async (e) => {
                      try {
                        await updatePartnerField(
                          "willowStaffLead",
                          e.target.value,
                        );
                      } catch (err) {
                        console.error(
                          "Failed to update Willow Staff Lead:",
                          err,
                        );
                        alert(
                          "Failed to update Willow Staff Lead. Check console for details.",
                        );
                      }
                    }}
                    className="font-medium text-[var(--foreground)] bg-transparent border-none p-0 cursor-pointer hover:text-slate-700 focus:outline-none"
                  >
                    <option value="">Select lead...</option>
                    <option value="James Cryan">James Cryan</option>
                    <option value="Jaime Hudgins">Jaime Hudgins</option>
                    <option value="Ryan York">Ryan York</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Files & Links</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setShowAddAttachmentForm(!showAddAttachmentForm)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddAttachmentForm && (
                <div className="mb-4 p-3 bg-[var(--muted)] rounded-lg space-y-2">
                  <Input
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="Link name (e.g., Contract, School Calendar)"
                    className="text-sm"
                  />
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddLink}>
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Add Link
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddAttachmentForm(false);
                        setLinkName("");
                        setLinkUrl("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-2 p-2 bg-[var(--muted)] rounded-md"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {attachment.type === "file" ? (
                          <Paperclip className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                        ) : (
                          <LinkIcon className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                        )}
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-700 hover:underline truncate"
                        >
                          {attachment.name}
                        </a>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-[var(--muted-foreground)] hover:text-red-500 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No files or links attached yet. Click + to add a link.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
