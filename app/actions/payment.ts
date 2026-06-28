'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitManualPayment({ courseId, amount, method, senderNumber, transactionId }: { courseId: number, amount: number, method: string, senderNumber: string, transactionId: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to submit a payment.' };
    }

    // Insert into manual_payments
    const { error } = await supabase
        .from('manual_payments')
        .insert({
            user_id: user.id,
            course_id: courseId,
            amount: amount,
            payment_method: method,
            sender_number: senderNumber,
            transaction_id: transactionId,
            status: 'pending'
        });

    if (error) {
        console.error('Payment submission error:', error);
        return { error: error.message };
    }

    return { success: true };
}

export async function getPendingPaymentsAdmin(courseId: number) {
    const supabase = await createClient();
    // Assuming admin has access, we just fetch
    const { data, error } = await supabase
        .from('manual_payments')
        .select('*, user:user_id(email)')
        .eq('course_id', courseId)
        .eq('status', 'pending');
    
    if (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
    
    return data || [];
}

export async function approvePaymentAdmin(paymentId: string, courseId: number, userId: string) {
    const supabase = await createClient();
    
    // Update status
    const { error: updateError } = await supabase
        .from('manual_payments')
        .update({ status: 'approved' })
        .eq('id', paymentId);
        
    if (updateError) {
        return { error: updateError.message };
    }

    // Enroll user in course
    const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({
            user_id: userId,
            course_id: courseId,
            status: 'active'
        });
        
    if (enrollError && enrollError.code !== '23505') { // Ignore unique constraint if already enrolled
        return { error: enrollError.message };
    }
    
    revalidatePath(`/admin`);
    return { success: true };
}

export async function rejectPaymentAdmin(paymentId: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('manual_payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId);
        
    if (error) {
        return { error: error.message };
    }
    
    revalidatePath(`/admin`);
    return { success: true };
}

export async function getUserPayments() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('manual_payments')
        .select('*, course:course_id(title, image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
    return data || [];
}
