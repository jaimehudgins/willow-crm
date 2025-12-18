"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  DbPartner,
  DbContact,
  DbTouchpoint,
  DbOnboardingTask,
} from "@/lib/supabase";
import type {
  Partner,
  PartnerStatus,
  LeadSource,
  OnboardingStep,
  PartnershipHealth,
  Priority,
  SchoolType,
  Note,
  OnboardingTask,
  Contact,
} from "@/data/partners";

// Transform database partner to frontend Partner type
function transformPartner(
  dbPartner: DbPartner,
  contacts: DbContact[],
  touchpoints: DbTouchpoint[],
  onboardingTasks: DbOnboardingTask[],
): Partner {
  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

  return {
    id: dbPartner.id || "",
    name: dbPartner.name || "",
    status: (dbPartner.status as PartnerStatus) || "New Lead",
    leadSource: dbPartner.lead_source as LeadSource | undefined,
    onboardingStep: dbPartner.onboarding_step as OnboardingStep | undefined,
    partnershipHealth: dbPartner.relationship_health as
      | PartnershipHealth
      | undefined,
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
          title: primaryContact.title || "",
          email: primaryContact.email || "",
          phone: primaryContact.phone || "",
        }
      : {
          name: "",
          title: "",
          email: "",
          phone: "",
        },
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name || "",
      title: c.title || "",
      email: c.email || "",
      phone: c.phone || "",
      isPrimary: c.is_primary ?? false,
    })),
    summary: dbPartner.summary || "",
    painPoints: dbPartner.pain_points || [],
    onboardingChecklist: (onboardingTasks || [])
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((t) => ({
        task: t.task || "",
        completed: t.completed ?? false,
      })),
    notes: (touchpoints || []).map((t) => ({
      date: t.date || "",
      author: t.author || "",
      content: t.content || "",
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
      const [contactsResult, touchpointsResult, tasksResult] =
        await Promise.all([
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
        ]);

      if (contactsResult.error) throw contactsResult.error;
      if (touchpointsResult.error) throw touchpointsResult.error;
      if (tasksResult.error) throw tasksResult.error;

      const contacts = contactsResult.data || [];
      const touchpoints = touchpointsResult.data || [];
      const tasks = tasksResult.data || [];

      // Transform each partner with its related data
      const transformedPartners = partnersData.map((dbPartner) =>
        transformPartner(
          dbPartner,
          contacts.filter((c) => c.partner_id === dbPartner.id),
          touchpoints.filter((t) => t.partner_id === dbPartner.id),
          tasks.filter((t) => t.partner_id === dbPartner.id),
        ),
      );

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
      const [contactsResult, touchpointsResult, tasksResult] =
        await Promise.all([
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
        ]);

      if (contactsResult.error) throw contactsResult.error;
      if (touchpointsResult.error) throw touchpointsResult.error;
      if (tasksResult.error) throw tasksResult.error;

      const transformedPartner = transformPartner(
        partnerData,
        contactsResult.data || [],
        touchpointsResult.data || [],
        tasksResult.data || [],
      );

      setPartner(transformedPartner);
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
        .update({ completed })
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

  // Add a note (touchpoint)
  const addNote = async (content: string, author: string = "You") => {
    if (!partner) return;

    try {
      const newTouchpoint = {
        partner_id: id,
        date: new Date().toISOString().split("T")[0],
        author,
        content,
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
          date: data.date,
          author: data.author,
          content: data.content,
        };
        return { ...prev, notes: [newNote, ...prev.notes] };
      });

      return data;
    } catch (err) {
      console.error("Error adding note:", err);
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
    title: string;
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
        .order("is_primary", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (contacts && contacts.length > 0) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from("contacts")
          .update({
            name: contact.name,
            title: contact.title,
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
          title: contact.title,
          email: contact.email,
          phone: contact.phone,
          is_primary: true,
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
    title: string;
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
          title: contact.title,
          email: contact.email,
          phone: contact.phone,
          is_primary: (partner.contacts || []).length === 0, // First contact is primary
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newContact: Contact = {
        id: data.id,
        name: data.name || "",
        title: data.title || "",
        email: data.email || "",
        phone: data.phone || "",
        isPrimary: data.is_primary ?? false,
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
    contact: { name: string; title: string; email: string; phone: string },
  ) => {
    if (!partner) return;

    try {
      const { error: updateError } = await supabase
        .from("contacts")
        .update({
          name: contact.name,
          title: contact.title,
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
                title: primaryContact.title,
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
                title: primaryContact.title,
                email: primaryContact.email,
                phone: primaryContact.phone,
              }
            : { name: "", title: "", email: "", phone: "" },
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
        .update({ is_primary: false })
        .eq("partner_id", id);

      if (unsetError) throw unsetError;

      // Then set the selected contact as primary
      const { error: setError } = await supabase
        .from("contacts")
        .update({ is_primary: true })
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
                title: primaryContact.title,
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

  return {
    partner,
    loading,
    error,
    refetch: fetchPartner,
    updateOnboardingTask,
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
  };
}
