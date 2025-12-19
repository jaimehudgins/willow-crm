"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  DbPartner,
  DbContact,
  DbTouchpoint,
  DbOnboardingTask,
  DbSchool,
  DbFollowUpTask,
  DbAttachment,
} from "@/lib/supabase";
import type {
  Partner,
  PartnerStatus,
  LeadSource,
  OnboardingStep,
  PartnershipHealth,
  RenewalStatus,
  Priority,
  SchoolType,
  Note,
  NoteType,
  FollowUpTask,
  OnboardingTask,
  Contact,
  School,
  TaskStatus,
  Attachment,
} from "@/data/partners";
import { CORE_ONBOARDING_TASKS } from "@/data/partners";

// Transform database partner to frontend Partner type
function transformPartner(
  dbPartner: DbPartner,
  contacts: DbContact[],
  touchpoints: DbTouchpoint[],
  onboardingTasks: DbOnboardingTask[],
  followUpTasks: DbFollowUpTask[] = [],
  standaloneTasks: DbFollowUpTask[] = [],
): Partner {
  const primaryContact =
    contacts.find((c) => c.is_primary_contact) || contacts[0];

  return {
    id: dbPartner.id || "",
    name: dbPartner.name || "",
    status: (dbPartner.status as PartnerStatus) || "New Lead",
    leadSource: dbPartner.lead_source as LeadSource | undefined,
    onboardingStep: dbPartner.onboarding_step as OnboardingStep | undefined,
    partnershipHealth: dbPartner.relationship_health as
      | PartnershipHealth
      | undefined,
    renewalStatus: dbPartner.renewal_status as RenewalStatus | undefined,
    priority: (dbPartner.priority as Priority) || "Medium",
    schoolType: (dbPartner.school_type as SchoolType) || "Public",
    studentCount: dbPartner.student_count ?? 0,
    staffCount: dbPartner.staff_count ?? 0,
    schoolCount: dbPartner.school_count ?? 1,
    district: dbPartner.district || "",
    address: dbPartner.address || "",
    cityState: dbPartner.city_state || "",
    timeZone: dbPartner.time_zone || "",
    lastContactDate: dbPartner.last_contact_date || "",
    nextFollowUp: dbPartner.next_follow_up || null,
    proposalDeadline: dbPartner.proposal_deadline || null,
    contractValue: dbPartner.contract_value ?? null,
    contractLink: dbPartner.contract_link || "",
    willowStaffLead: dbPartner.willow_staff_lead || "",
    leadContact: primaryContact
      ? {
          name: primaryContact.name || "",
          role: primaryContact.role || "",
          email: primaryContact.email || "",
          phone: primaryContact.phone || "",
        }
      : {
          name: "",
          role: "",
          email: "",
          phone: "",
        },
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name || "",
      role: c.role || "",
      email: c.email || "",
      phone: c.phone || "",
      isPrimary: c.is_primary_contact ?? false,
    })),
    summary: dbPartner.summary || "",
    painPoints: dbPartner.pain_points || [],
    onboardingChecklist: (onboardingTasks || [])
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((t) => ({
        task: t.title || "",
        completed: t.status === "completed",
        isCustom: t.is_custom ?? false,
        dueDate: t.due_date || undefined,
      })),
    notes: (touchpoints || []).map((t) => ({
      id: t.id,
      date: t.date || "",
      author: t.author || "",
      content: t.notes || "",
      type: (t.type as NoteType) || "Internal Note",
      followUpTasks: followUpTasks
        .filter((ft) => ft.touchpoint_id === t.id)
        .map((ft) => ({
          id: ft.id,
          task: ft.task,
          dueDate: ft.due_date,
          completed: ft.completed,
          status: (ft.status as TaskStatus) || "Not Started",
          notes: ft.notes,
        })),
    })),
    tasks: standaloneTasks.map((ft) => ({
      id: ft.id,
      task: ft.task,
      dueDate: ft.due_date,
      completed: ft.completed,
      status: (ft.status as TaskStatus) || "Not Started",
      notes: ft.notes,
    })),
  };
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all partners
      const { data: partnersData, error: partnersError } = await supabase
        .from("partners")
        .select("*")
        .order("name");

      if (partnersError) throw partnersError;

      if (!partnersData || partnersData.length === 0) {
        setPartners([]);
        return;
      }

      const partnerIds = partnersData.map((p) => p.id);

      // Fetch all related data in parallel
      const [
        contactsResult,
        touchpointsResult,
        tasksResult,
        followUpTasksResult,
      ] = await Promise.all([
        supabase.from("contacts").select("*").in("partner_id", partnerIds),
        supabase
          .from("touchpoints")
          .select("*")
          .in("partner_id", partnerIds)
          .order("date", { ascending: false }),
        supabase
          .from("onboarding_tasks")
          .select("*")
          .in("partner_id", partnerIds)
          .order("order_index"),
        supabase
          .from("follow_up_tasks")
          .select("*")
          .order("due_date", { ascending: true }),
      ]);

      if (contactsResult.error) throw contactsResult.error;
      if (touchpointsResult.error) throw touchpointsResult.error;
      if (tasksResult.error) throw tasksResult.error;
      // follow_up_tasks table may not exist yet
      if (followUpTasksResult.error) {
        console.warn(
          "Follow-up tasks table not available:",
          followUpTasksResult.error,
        );
      }

      const contacts = contactsResult.data || [];
      const touchpoints = touchpointsResult.data || [];
      const tasks = tasksResult.data || [];
      const followUpTasks = followUpTasksResult.data || [];

      // Transform each partner with its related data
      const transformedPartners = partnersData.map((dbPartner) => {
        const partnerTouchpoints = touchpoints.filter(
          (t) => t.partner_id === dbPartner.id,
        );
        const touchpointIds = partnerTouchpoints.map((t) => t.id);
        return transformPartner(
          dbPartner,
          contacts.filter((c) => c.partner_id === dbPartner.id),
          partnerTouchpoints,
          tasks.filter((t) => t.partner_id === dbPartner.id),
          followUpTasks.filter((ft) =>
            touchpointIds.includes(ft.touchpoint_id),
          ),
          followUpTasks.filter(
            (ft) => ft.partner_id === dbPartner.id && !ft.touchpoint_id,
          ),
        );
      });

      setPartners(transformedPartners);
    } catch (err) {
      console.error("Error fetching partners:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return { partners, loading, error, refetch: fetchPartners };
}

export function usePartner(id: string) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartner = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the partner
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("*")
        .eq("id", id)
        .single();

      if (partnerError) {
        if (partnerError.code === "PGRST116") {
          setPartner(null);
          return;
        }
        throw partnerError;
      }

      // Fetch related data in parallel
      const [
        contactsResult,
        touchpointsResult,
        tasksResult,
        schoolsResult,
        followUpTasksResult,
        attachmentsResult,
      ] = await Promise.all([
        supabase.from("contacts").select("*").eq("partner_id", id),
        supabase
          .from("touchpoints")
          .select("*")
          .eq("partner_id", id)
          .order("date", { ascending: false }),
        supabase
          .from("onboarding_tasks")
          .select("*")
          .eq("partner_id", id)
          .order("order_index"),
        supabase.from("schools").select("*").eq("partner_id", id).order("name"),
        supabase
          .from("follow_up_tasks")
          .select("*")
          .order("due_date", { ascending: true }),
        supabase
          .from("attachments")
          .select("*")
          .eq("partner_id", id)
          .order("created_at", { ascending: false }),
      ]);

      if (contactsResult.error) throw contactsResult.error;
      if (touchpointsResult.error) throw touchpointsResult.error;
      if (tasksResult.error) throw tasksResult.error;
      // Schools table may not exist yet, so we don't throw on error
      if (schoolsResult.error) {
        console.warn("Schools table not available:", schoolsResult.error);
      }
      // follow_up_tasks table may not exist yet
      if (followUpTasksResult.error) {
        console.warn(
          "Follow-up tasks table not available:",
          followUpTasksResult.error,
        );
      }

      const touchpoints = touchpointsResult.data || [];
      const touchpointIds = touchpoints.map((t) => t.id);
      const allFollowUpTasks = followUpTasksResult.data || [];
      const followUpTasks = allFollowUpTasks.filter((ft) =>
        touchpointIds.includes(ft.touchpoint_id),
      );
      const standaloneTasks = allFollowUpTasks.filter(
        (ft) => ft.partner_id === id && !ft.touchpoint_id,
      );

      const transformedPartner = transformPartner(
        partnerData,
        contactsResult.data || [],
        touchpoints,
        tasksResult.data || [],
        followUpTasks,
        standaloneTasks,
      );

      setPartner(transformedPartner);

      // Transform schools
      const transformedSchools: School[] = (schoolsResult.data || []).map(
        (s: DbSchool) => ({
          id: s.id,
          name: s.name || "",
          schoolType: s.school_type || "Public",
          studentCount: s.student_count ?? 0,
          staffCount: s.staff_count ?? 0,
          district: s.district || "",
          address: s.address || "",
        }),
      );
      setSchools(transformedSchools);

      // Transform attachments
      const transformedAttachments: Attachment[] = (
        attachmentsResult.data || []
      ).map((a: DbAttachment) => ({
        id: a.id,
        name: a.name || "",
        url: a.url || "",
        type: (a.type as "file" | "link") || "link",
      }));
      setAttachments(transformedAttachments);
    } catch (err) {
      console.error("Error fetching partner:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch partner");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPartner();
  }, [fetchPartner]);

  // Update onboarding task
  const updateOnboardingTask = async (
    taskIndex: number,
    completed: boolean,
  ) => {
    if (!partner) return;

    try {
      // Get the task from the database
      const { data: tasks, error: fetchError } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("partner_id", id)
        .order("order_index");

      if (fetchError) throw fetchError;

      const task = tasks?.[taskIndex];
      if (!task) return;

      const { error: updateError } = await supabase
        .from("onboarding_tasks")
        .update({ status: completed ? "completed" : "pending" })
        .eq("id", task.id);

      if (updateError) throw updateError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        const newChecklist = [...prev.onboardingChecklist];
        newChecklist[taskIndex] = { ...newChecklist[taskIndex], completed };
        return { ...prev, onboardingChecklist: newChecklist };
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // Initialize default onboarding tasks for a partner
  const initializeOnboardingTasks = async () => {
    if (!partner) return;

    try {
      // Check if tasks already exist
      const { data: existingTasks } = await supabase
        .from("onboarding_tasks")
        .select("id")
        .eq("partner_id", id);

      if (existingTasks && existingTasks.length > 0) {
        console.log("Tasks already exist for this partner");
        return;
      }

      // Create core tasks only
      const allTasks = CORE_ONBOARDING_TASKS.map((task, index) => ({
        partner_id: id,
        title: task,
        status: "pending",
        order_index: index,
        is_custom: false,
      }));

      const { error: insertError } = await supabase
        .from("onboarding_tasks")
        .insert(allTasks);

      if (insertError) throw insertError;

      // Refetch to get the updated data
      await fetchPartner();
    } catch (err) {
      console.error("Error initializing onboarding tasks:", err);
      throw err;
    }
  };

  // Update a custom task's text
  const updateCustomTaskText = async (taskIndex: number, newText: string) => {
    if (!partner) return;

    try {
      // Get the task from the database
      const { data: tasks, error: fetchError } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("partner_id", id)
        .order("order_index");

      if (fetchError) throw fetchError;

      const task = tasks?.[taskIndex];
      if (!task) return;

      const { error: updateError } = await supabase
        .from("onboarding_tasks")
        .update({ title: newText })
        .eq("id", task.id);

      if (updateError) throw updateError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        const newChecklist = [...prev.onboardingChecklist];
        newChecklist[taskIndex] = { ...newChecklist[taskIndex], task: newText };
        return { ...prev, onboardingChecklist: newChecklist };
      });
    } catch (err) {
      console.error("Error updating custom task:", err);
      throw err;
    }
  };

  // Update a task's due date
  const updateTaskDueDate = async (
    taskIndex: number,
    dueDate: string | null,
  ) => {
    if (!partner) return;

    try {
      const { data: tasks, error: fetchError } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("partner_id", id)
        .order("order_index");

      if (fetchError) throw fetchError;

      const task = tasks?.[taskIndex];
      if (!task) return;

      const { error: updateError } = await supabase
        .from("onboarding_tasks")
        .update({ due_date: dueDate })
        .eq("id", task.id);

      if (updateError) throw updateError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        const newChecklist = [...prev.onboardingChecklist];
        newChecklist[taskIndex] = {
          ...newChecklist[taskIndex],
          dueDate: dueDate || undefined,
        };
        return { ...prev, onboardingChecklist: newChecklist };
      });
    } catch (err) {
      console.error("Error updating task due date:", err);
      throw err;
    }
  };

  // Add a new custom task
  const addCustomTask = async (taskTitle: string) => {
    if (!partner) return;

    try {
      // Get the highest order_index
      const { data: tasks, error: fetchError } = await supabase
        .from("onboarding_tasks")
        .select("order_index")
        .eq("partner_id", id)
        .order("order_index", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextIndex =
        tasks && tasks.length > 0 ? tasks[0].order_index + 1 : 0;

      const { data, error: insertError } = await supabase
        .from("onboarding_tasks")
        .insert({
          partner_id: id,
          title: taskTitle,
          status: "pending",
          order_index: nextIndex,
          is_custom: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          onboardingChecklist: [
            ...prev.onboardingChecklist,
            { task: taskTitle, completed: false, isCustom: true },
          ],
        };
      });

      return data;
    } catch (err) {
      console.error("Error adding custom task:", err);
      throw err;
    }
  };

  // Add a note (touchpoint)
  const addNote = async (
    content: string,
    author: string = "You",
    type: NoteType = "Internal Note",
    date?: string,
  ) => {
    if (!partner) return;

    try {
      // Use local date if no date provided
      const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const newTouchpoint = {
        partner_id: id,
        date: date || getLocalDate(),
        author,
        title: type,
        notes: content,
        type,
      };

      const { data, error: insertError } = await supabase
        .from("touchpoints")
        .insert(newTouchpoint)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        const newNote: Note = {
          id: data.id,
          date: data.date,
          author: data.author,
          content: data.notes,
          type: data.type as NoteType,
          followUpTasks: [],
        };
        return { ...prev, notes: [newNote, ...prev.notes] };
      });

      return data;
    } catch (err) {
      console.error("Error adding note:", err);
      throw err;
    }
  };

  // Delete a note (touchpoint)
  const deleteNote = async (noteId: string) => {
    if (!partner) return;

    try {
      // First delete any follow-up tasks associated with this note
      await supabase
        .from("follow_up_tasks")
        .delete()
        .eq("touchpoint_id", noteId);

      // Then delete the note itself
      const { error: deleteError } = await supabase
        .from("touchpoints")
        .delete()
        .eq("id", noteId);

      if (deleteError) throw deleteError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notes: prev.notes.filter((n) => n.id !== noteId),
        };
      });
    } catch (err) {
      console.error("Error deleting note:", err);
      throw err;
    }
  };

  // Update a note (touchpoint)
  const updateNote = async (
    noteId: string,
    updates: {
      content?: string;
      type?: NoteType;
      date?: string;
    },
  ) => {
    if (!partner) return;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.content !== undefined) dbUpdates.notes = updates.content;
      if (updates.type !== undefined) {
        dbUpdates.type = updates.type;
        dbUpdates.title = updates.type;
      }
      if (updates.date !== undefined) dbUpdates.date = updates.date;

      const { error: updateError } = await supabase
        .from("touchpoints")
        .update(dbUpdates)
        .eq("id", noteId);

      if (updateError) throw updateError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notes: prev.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  content: updates.content ?? n.content,
                  type: updates.type ?? n.type,
                  date: updates.date ?? n.date,
                }
              : n,
          ),
        };
      });
    } catch (err) {
      console.error("Error updating note:", err);
      throw err;
    }
  };

  // Update partnership health
  const updatePartnershipHealth = async (health: PartnershipHealth) => {
    if (!partner) return;

    try {
      const { error: updateError } = await supabase
        .from("partners")
        .update({ relationship_health: health })
        .eq("id", id);

      if (updateError) throw updateError;

      setPartner((prev) => {
        if (!prev) return prev;
        return { ...prev, partnershipHealth: health };
      });
    } catch (err) {
      console.error("Error updating partnership health:", err);
      throw err;
    }
  };

  // Update partner status
  const updateStatus = async (status: PartnerStatus) => {
    if (!partner) return;

    try {
      const { error: updateError } = await supabase
        .from("partners")
        .update({ status })
        .eq("id", id);

      if (updateError) throw updateError;

      setPartner((prev) => {
        if (!prev) return prev;
        return { ...prev, status };
      });
    } catch (err) {
      console.error("Error updating status:", err);
      throw err;
    }
  };

  // Update partner priority
  const updatePriority = async (priority: Priority) => {
    if (!partner) return;

    try {
      const { error: updateError } = await supabase
        .from("partners")
        .update({ priority })
        .eq("id", id);

      if (updateError) throw updateError;

      setPartner((prev) => {
        if (!prev) return prev;
        return { ...prev, priority };
      });
    } catch (err) {
      console.error("Error updating priority:", err);
      throw err;
    }
  };

  // Update partner field (generic)
  const updatePartnerField = async (
    field: string,
    value: string | number | string[],
  ) => {
    if (!partner) return;

    // Map frontend field names to database column names
    const fieldMapping: Record<string, string> = {
      studentCount: "student_count",
      staffCount: "staff_count",
      schoolCount: "school_count",
      schoolType: "school_type",
      cityState: "city_state",
      timeZone: "time_zone",
      willowStaffLead: "willow_staff_lead",
      painPoints: "pain_points",
      partnershipHealth: "relationship_health",
      renewalStatus: "renewal_status",
      lastContactDate: "last_contact_date",
      nextFollowUp: "next_follow_up",
      proposalDeadline: "proposal_deadline",
      contractValue: "contract_value",
      contractLink: "contract_link",
      leadSource: "lead_source",
      onboardingStep: "onboarding_step",
    };

    const dbField = fieldMapping[field] || field;

    try {
      const { error: updateError } = await supabase
        .from("partners")
        .update({ [dbField]: value })
        .eq("id", id);

      if (updateError) throw updateError;

      setPartner((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      throw err;
    }
  };

  // Update lead contact
  const updateLeadContact = async (contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  }) => {
    if (!partner) return;

    try {
      // First, find the primary contact
      const { data: contacts, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("partner_id", id)
        .order("is_primary_contact", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (contacts && contacts.length > 0) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from("contacts")
          .update({
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
          })
          .eq("id", contacts[0].id);

        if (updateError) throw updateError;
      } else {
        // Create new contact
        const { error: insertError } = await supabase.from("contacts").insert({
          partner_id: id,
          name: contact.name,
          role: contact.role,
          email: contact.email,
          phone: contact.phone,
          is_primary_contact: true,
        });

        if (insertError) throw insertError;
      }

      setPartner((prev) => {
        if (!prev) return prev;
        return { ...prev, leadContact: contact };
      });
    } catch (err) {
      console.error("Error updating lead contact:", err);
      throw err;
    }
  };

  // Add a new contact
  const addContact = async (contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  }) => {
    if (!partner) return;

    try {
      const { data, error: insertError } = await supabase
        .from("contacts")
        .insert({
          partner_id: id,
          name: contact.name,
          role: contact.role,
          email: contact.email,
          phone: contact.phone,
          is_primary_contact: (partner.contacts || []).length === 0, // First contact is primary
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newContact: Contact = {
        id: data.id,
        name: data.name || "",
        role: data.role || "",
        email: data.email || "",
        phone: data.phone || "",
        isPrimary: data.is_primary_contact ?? false,
      };

      setPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          contacts: [...(prev.contacts || []), newContact],
          leadContact: newContact.isPrimary ? contact : prev.leadContact,
        };
      });

      return data;
    } catch (err) {
      console.error("Error adding contact:", err);
      throw err;
    }
  };

  // Update a contact
  const updateContact = async (
    contactId: string,
    contact: { name: string; role: string; email: string; phone: string },
  ) => {
    if (!partner) return;

    try {
      const { error: updateError } = await supabase
        .from("contacts")
        .update({
          name: contact.name,
          role: contact.role,
          email: contact.email,
          phone: contact.phone,
        })
        .eq("id", contactId);

      if (updateError) throw updateError;

      setPartner((prev) => {
        if (!prev) return prev;
        const updatedContacts = (prev.contacts || []).map((c) =>
          c.id === contactId ? { ...c, ...contact } : c,
        );
        const primaryContact = updatedContacts.find((c) => c.isPrimary);
        return {
          ...prev,
          contacts: updatedContacts,
          leadContact: primaryContact
            ? {
                name: primaryContact.name,
                role: primaryContact.role,
                email: primaryContact.email,
                phone: primaryContact.phone,
              }
            : prev.leadContact,
        };
      });
    } catch (err) {
      console.error("Error updating contact:", err);
      throw err;
    }
  };

  // Delete a contact
  const deleteContact = async (contactId: string) => {
    if (!partner) return;

    try {
      const { error: deleteError } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contactId);

      if (deleteError) throw deleteError;

      setPartner((prev) => {
        if (!prev) return prev;
        const updatedContacts = (prev.contacts || []).filter(
          (c) => c.id !== contactId,
        );
        const primaryContact = updatedContacts.find((c) => c.isPrimary);
        return {
          ...prev,
          contacts: updatedContacts,
          leadContact: primaryContact
            ? {
                name: primaryContact.name,
                role: primaryContact.role,
                email: primaryContact.email,
                phone: primaryContact.phone,
              }
            : { name: "", role: "", email: "", phone: "" },
        };
      });
    } catch (err) {
      console.error("Error deleting contact:", err);
      throw err;
    }
  };

  // Set a contact as primary
  const setPrimaryContact = async (contactId: string) => {
    if (!partner) return;

    try {
      // First, unset all contacts as primary
      const { error: unsetError } = await supabase
        .from("contacts")
        .update({ is_primary_contact: false })
        .eq("partner_id", id);

      if (unsetError) throw unsetError;

      // Then set the selected contact as primary
      const { error: setError } = await supabase
        .from("contacts")
        .update({ is_primary_contact: true })
        .eq("id", contactId);

      if (setError) throw setError;

      setPartner((prev) => {
        if (!prev) return prev;
        const updatedContacts = (prev.contacts || []).map((c) => ({
          ...c,
          isPrimary: c.id === contactId,
        }));
        const primaryContact = updatedContacts.find((c) => c.isPrimary);
        return {
          ...prev,
          contacts: updatedContacts,
          leadContact: primaryContact
            ? {
                name: primaryContact.name,
                role: primaryContact.role,
                email: primaryContact.email,
                phone: primaryContact.phone,
              }
            : prev.leadContact,
        };
      });
    } catch (err) {
      console.error("Error setting primary contact:", err);
      throw err;
    }
  };

  // Add a follow-up task to a note
  const addFollowUpTask = async (
    noteId: string,
    task: string,
    dueDate: string | null = null,
    notes: string = "",
  ) => {
    if (!partner) return;

    try {
      const { data, error: insertError } = await supabase
        .from("follow_up_tasks")
        .insert({
          touchpoint_id: noteId,
          task,
          due_date: dueDate,
          completed: false,
          status: "Not Started",
          notes,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        const updatedNotes = prev.notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              followUpTasks: [
                ...(note.followUpTasks || []),
                {
                  id: data.id,
                  task: data.task,
                  dueDate: data.due_date,
                  completed: data.completed,
                  status: (data.status as TaskStatus) || "Not Started",
                  notes: data.notes,
                },
              ],
            };
          }
          return note;
        });
        return { ...prev, notes: updatedNotes };
      });

      return data;
    } catch (err) {
      console.error("Error adding follow-up task:", err);
      throw err;
    }
  };

  // Update a follow-up task
  const updateFollowUpTask = async (
    taskId: string,
    updates: {
      task?: string;
      dueDate?: string | null;
      completed?: boolean;
      status?: TaskStatus;
      notes?: string;
    },
  ) => {
    if (!partner) return;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.task !== undefined) dbUpdates.task = updates.task;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.completed !== undefined)
        dbUpdates.completed = updates.completed;
      if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
        // Sync completed flag with status
        dbUpdates.completed = updates.status === "Complete";
      }
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error: updateError } = await supabase
        .from("follow_up_tasks")
        .update(dbUpdates)
        .eq("id", taskId);

      if (updateError) throw updateError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        const updatedNotes = prev.notes.map((note) => ({
          ...note,
          followUpTasks: (note.followUpTasks || []).map((ft) =>
            ft.id === taskId
              ? {
                  ...ft,
                  task: updates.task ?? ft.task,
                  dueDate:
                    updates.dueDate !== undefined
                      ? updates.dueDate
                      : ft.dueDate,
                  completed: updates.status
                    ? updates.status === "Complete"
                    : (updates.completed ?? ft.completed),
                  status: updates.status ?? ft.status,
                  notes: updates.notes ?? ft.notes,
                }
              : ft,
          ),
        }));
        return { ...prev, notes: updatedNotes };
      });
    } catch (err) {
      console.error("Error updating follow-up task:", err);
      throw err;
    }
  };

  // Delete a follow-up task
  const deleteFollowUpTask = async (taskId: string) => {
    if (!partner) return;

    try {
      const { error: deleteError } = await supabase
        .from("follow_up_tasks")
        .delete()
        .eq("id", taskId);

      if (deleteError) throw deleteError;

      // Update local state - check both notes and standalone tasks
      setPartner((prev) => {
        if (!prev) return prev;
        const updatedNotes = prev.notes.map((note) => ({
          ...note,
          followUpTasks: (note.followUpTasks || []).filter(
            (ft) => ft.id !== taskId,
          ),
        }));
        const updatedTasks = (prev.tasks || []).filter((t) => t.id !== taskId);
        return { ...prev, notes: updatedNotes, tasks: updatedTasks };
      });
    } catch (err) {
      console.error("Error deleting follow-up task:", err);
      throw err;
    }
  };

  // Add a standalone task (not linked to a note)
  const addTask = async (
    task: string,
    dueDate: string | null = null,
    notes: string = "",
  ) => {
    if (!partner) return;

    try {
      const { data, error: insertError } = await supabase
        .from("follow_up_tasks")
        .insert({
          partner_id: id,
          task,
          due_date: dueDate,
          completed: false,
          status: "Not Started",
          notes,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: [
            ...(prev.tasks || []),
            {
              id: data.id,
              task: data.task,
              dueDate: data.due_date,
              completed: data.completed,
              status: (data.status as TaskStatus) || "Not Started",
              notes: data.notes,
            },
          ],
        };
      });

      return data;
    } catch (err) {
      console.error("Error adding task:", err);
      throw err;
    }
  };

  // Update a standalone task
  const updateTask = async (
    taskId: string,
    updates: {
      task?: string;
      dueDate?: string | null;
      completed?: boolean;
      status?: TaskStatus;
      notes?: string;
    },
  ) => {
    if (!partner) return;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.task !== undefined) dbUpdates.task = updates.task;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.completed !== undefined)
        dbUpdates.completed = updates.completed;
      if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
        // Sync completed flag with status
        dbUpdates.completed = updates.status === "Complete";
      }
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error: updateError } = await supabase
        .from("follow_up_tasks")
        .update(dbUpdates)
        .eq("id", taskId);

      if (updateError) throw updateError;

      // Update local state
      setPartner((prev) => {
        if (!prev) return prev;
        const updatedTasks = (prev.tasks || []).map((t) =>
          t.id === taskId
            ? {
                ...t,
                task: updates.task ?? t.task,
                dueDate:
                  updates.dueDate !== undefined ? updates.dueDate : t.dueDate,
                completed: updates.status
                  ? updates.status === "Complete"
                  : (updates.completed ?? t.completed),
                status: updates.status ?? t.status,
                notes: updates.notes ?? t.notes,
              }
            : t,
        );
        return { ...prev, tasks: updatedTasks };
      });
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  // Update a school
  const updateSchool = async (
    schoolId: string,
    updates: {
      name?: string;
      schoolType?: string;
      studentCount?: number;
      staffCount?: number;
      district?: string;
      address?: string;
    },
  ) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.schoolType !== undefined)
        dbUpdates.school_type = updates.schoolType;
      if (updates.studentCount !== undefined)
        dbUpdates.student_count = updates.studentCount;
      if (updates.staffCount !== undefined)
        dbUpdates.staff_count = updates.staffCount;
      if (updates.district !== undefined) dbUpdates.district = updates.district;
      if (updates.address !== undefined) dbUpdates.address = updates.address;

      const { error: updateError } = await supabase
        .from("schools")
        .update(dbUpdates)
        .eq("id", schoolId);

      if (updateError) throw updateError;

      // Update local state
      setSchools((prev) =>
        prev.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                name: updates.name ?? s.name,
                schoolType: updates.schoolType ?? s.schoolType,
                studentCount: updates.studentCount ?? s.studentCount,
                staffCount: updates.staffCount ?? s.staffCount,
                district: updates.district ?? s.district,
                address: updates.address ?? s.address,
              }
            : s,
        ),
      );
    } catch (err) {
      console.error("Error updating school:", err);
      throw err;
    }
  };

  // Add an attachment (file or link)
  const addAttachment = async (
    name: string,
    url: string,
    type: "file" | "link",
  ) => {
    try {
      const { data, error: insertError } = await supabase
        .from("attachments")
        .insert({
          partner_id: id,
          name,
          url,
          type,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      const newAttachment: Attachment = {
        id: data.id,
        name: data.name,
        url: data.url,
        type: data.type as "file" | "link",
      };
      setAttachments((prev) => [newAttachment, ...prev]);

      return data;
    } catch (err) {
      console.error("Error adding attachment:", err);
      throw err;
    }
  };

  // Delete an attachment
  const deleteAttachment = async (attachmentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("attachments")
        .delete()
        .eq("id", attachmentId);

      if (deleteError) throw deleteError;

      // Update local state
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      console.error("Error deleting attachment:", err);
      throw err;
    }
  };

  return {
    partner,
    schools,
    attachments,
    loading,
    error,
    refetch: fetchPartner,
    updateOnboardingTask,
    initializeOnboardingTasks,
    updateCustomTaskText,
    updateTaskDueDate,
    addCustomTask,
    addNote,
    deleteNote,
    updateNote,
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
    updateSchool,
    addAttachment,
    deleteAttachment,
  };
}
