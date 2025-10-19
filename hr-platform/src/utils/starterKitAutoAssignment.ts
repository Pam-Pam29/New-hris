// Utility for auto-assigning starter kits to new employees
import { getAssetService } from '../pages/Hr/CoreHr/AssetManagement/services/assetService';

/**
 * Auto-assign starter kit assets to a new employee based on their job title
 * 
 * @param employeeId - Employee ID
 * @param employeeName - Employee full name
 * @param jobTitle - Job title to match against starter kits
 * @returns Result with assignment details
 */
export async function autoAssignStarterKitToNewEmployee(
    employeeId: string,
    employeeName: string,
    jobTitle: string
): Promise<{
    success: boolean;
    assignedCount: number;
    missingAssets: string[];
    message: string;
}> {
    try {
        console.log('🎁 Auto-assigning starter kit for:', employeeName, '(', jobTitle, ')');

        const assetService = await getAssetService();
        const result = await assetService.autoAssignStarterKit(employeeId, employeeName, jobTitle);

        let message = '';

        if (result.success) {
            message = `Successfully assigned ${result.assignedCount} asset(s) to ${employeeName}`;

            if (result.missingAssets.length > 0) {
                message += `\n\nNote: Some assets were unavailable:\n${result.missingAssets.join('\n')}`;
            }
        } else {
            message = `No starter kit found for job title: ${jobTitle}`;
        }

        return {
            ...result,
            message
        };
    } catch (error) {
        console.error('Failed to auto-assign starter kit:', error);
        return {
            success: false,
            assignedCount: 0,
            missingAssets: [],
            message: 'Failed to auto-assign starter kit'
        };
    }
}

/**
 * Check if a starter kit exists for a given job title
 */
export async function hasStarterKitForJobTitle(jobTitle: string): Promise<boolean> {
    try {
        const assetService = await getAssetService();
        const kit = await assetService.getStarterKitByJobTitle(jobTitle);
        return kit !== null;
    } catch (error) {
        console.error('Failed to check starter kit:', error);
        return false;
    }
}

/**
 * Get starter kit preview for a job title (for display during employee creation)
 */
export async function getStarterKitPreview(jobTitle: string): Promise<{
    kitName: string;
    assetCount: number;
    assets: string[];
} | null> {
    try {
        const assetService = await getAssetService();
        const kit = await assetService.getStarterKitByJobTitle(jobTitle);

        if (!kit) return null;

        return {
            kitName: kit.name,
            assetCount: kit.assets.reduce((sum, a) => sum + a.quantity, 0),
            assets: kit.assets.map(a => `${a.quantity}x ${a.assetType}${a.isRequired ? ' (Required)' : ''}`)
        };
    } catch (error) {
        console.error('Failed to get starter kit preview:', error);
        return null;
    }
}

