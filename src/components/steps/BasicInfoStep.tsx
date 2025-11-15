import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { DiscoveryFormData } from '../types';

interface BasicInfoStepProps {
  formData: DiscoveryFormData;
  updateFormData: (data: Partial<DiscoveryFormData>) => void;
}

export function BasicInfoStep({ formData, updateFormData }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name *</Label>
          <Input
            id="projectName"
            placeholder="e.g., Customer Analytics Platform"
            value={formData.projectName}
            onChange={(e) => updateFormData({ projectName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            placeholder="e.g., Data & Analytics"
            value={formData.department}
            onChange={(e) => updateFormData({ department: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="requestorName">Requestor Name *</Label>
          <Input
            id="requestorName"
            placeholder="Your full name"
            value={formData.requestorName}
            onChange={(e) => updateFormData({ requestorName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestorEmail">Email Address *</Label>
          <Input
            id="requestorEmail"
            type="email"
            placeholder="your.email@company.com"
            value={formData.requestorEmail}
            onChange={(e) => updateFormData({ requestorEmail: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority Level *</Label>
        <Select
          value={formData.priority}
          onValueChange={(value: any) => updateFormData({ priority: value })}
        >
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - Planning phase</SelectItem>
            <SelectItem value="medium">Medium - Active development</SelectItem>
            <SelectItem value="high">High - Critical path</SelectItem>
            <SelectItem value="critical">Critical - Urgent need</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
