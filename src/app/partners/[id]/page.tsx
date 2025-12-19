"use client";

import { useState, use, useEffect } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  statusColors,
  priorityColors,
  leadSourceColors,
  onboardingStepColors,
  partnershipHealthColors,
  noteTypeColors,
  statusOrder,
  type PartnershipHealth,
  type PartnerStatus,
  type Priority,
  type NoteType,
} from "@/data/partners";
import { formatDate } from "@/lib/utils";
import { usePartner } from "@/hooks/usePartners";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "file" | "link";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PartnerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    partner,
    schools,
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
  } = usePartner(id);

  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("Internal Note");
  const [noteDate, setNoteDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
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

  const toggleTask = async (index: number) => {
    const currentTask = partner.onboardingChecklist[index];
    await updateOnboardingTask(index, !currentTask.completed);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || isAddingNote) return;

    setIsAddingNote(true);
    try {
      await addNote(newNote.trim(), "You", noteType, noteDate);
      setNewNote("");
      setNoteType("Internal Note");
      setNoteDate(new Date().toISOString().split("T")[0]);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        type: "file",
      };
      setAttachments((prev) => [...prev, attachment]);
    });

    e.target.value = "";
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const attachment: Attachment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: linkName.trim() || linkUrl,
      url: linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`,
      type: "link",
    };

    setAttachments((prev) => [...prev, attachment]);
    setLinkUrl("");
    setLinkName("");
    setShowLinkForm(false);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Clock className="h-5 w-5 text-indigo-600" />
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
                      className="text-sm text-indigo-600 hover:underline"
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
                  className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
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
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
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
                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-indigo-300 p-4 bg-indigo-50">
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
                                  toggleTask(index);
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
                                  ? "text-indigo-600"
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
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 p-4 bg-indigo-50">
                        <Plus className="h-5 w-5 text-indigo-600 shrink-0" />
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
                        className="flex items-center gap-2 w-full rounded-lg border border-dashed border-[var(--border)] p-4 text-left text-[var(--muted-foreground)] hover:border-indigo-300 hover:text-indigo-600 transition-colors"
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
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this partner..."
                    className="w-full min-h-[100px] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                          <Paperclip className="h-4 w-4" />
                          <span>Attach file</span>
                        </div>
                      </label>
                      <button
                        onClick={() => setShowLinkForm(!showLinkForm)}
                        className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
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
                      <Button onClick={handleAddLink} size="sm">
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

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Attachments
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((attachment) => (
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
                              className="text-indigo-600 hover:underline"
                            >
                              {attachment.name}
                            </a>
                            <button
                              onClick={() => removeAttachment(attachment.id)}
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
                        className="border-l-2 border-indigo-200 pl-4"
                      >
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
                        <p className="mt-1 text-[var(--muted-foreground)]">
                          {note.content}
                        </p>

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
                              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
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

              {(!partner.tasks || partner.tasks.length === 0) &&
              !showAddStandaloneTask ? (
                <p className="text-center text-[var(--muted-foreground)] py-4">
                  No tasks yet
                </p>
              ) : (
                <div className="space-y-2">
                  {(partner.tasks || []).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-3 bg-[var(--muted)] rounded-md"
                    >
                      <button
                        onClick={() =>
                          updateTask(task.id, { completed: !task.completed })
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
                  <option value="Strong">Strong</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Monitoring (New)">Monitoring (New)</option>
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
                    className="p-3 bg-indigo-50 rounded-lg border border-indigo-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-indigo-600" />
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
                        className="font-medium text-[var(--foreground)] cursor-pointer hover:text-indigo-600 flex items-center gap-1"
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
                        className="text-sm text-[var(--muted-foreground)] cursor-pointer hover:text-indigo-600 flex items-center gap-1"
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
                        className="cursor-pointer hover:text-indigo-600"
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
                            <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200 space-y-2">
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
                                  className="p-1 text-[var(--muted-foreground)] hover:text-indigo-600"
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
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2"
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
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {school.studentCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {school.staffCount}
                          </span>
                          <span>{school.schoolType}</span>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <User className="h-6 w-6 text-indigo-600" />
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
                    className="font-medium text-[var(--foreground)] bg-transparent border-none p-0 cursor-pointer hover:text-indigo-600 focus:outline-none"
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
              <CardTitle>Files & Links</CardTitle>
            </CardHeader>
            <CardContent>
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
                          className="text-sm text-indigo-600 hover:underline truncate"
                        >
                          {attachment.name}
                        </a>
                      </div>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-[var(--muted-foreground)] hover:text-red-500 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No files or links attached yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
