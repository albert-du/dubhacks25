import { useState } from 'react';
import { User, Calendar, Download, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar as CalendarComponent } from './ui/calendar';

export function ProfilePanel() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSaveChanges = () => {
    // Save profile changes
    console.log('Saving profile:', { name, email, phone });
  };

  const handleExportPDF = () => {
    // Export history to PDF
    console.log('Exporting to PDF');
  };

  // Mock history data
  const history = [
    { date: '2025-10-18', activity: 'Practice - Flower', accuracy: 87, duration: '15 min' },
    { date: '2025-10-17', activity: 'Test - Spirals', accuracy: 82, duration: '10 min' },
    { date: '2025-10-16', activity: 'Play - Star', accuracy: null, duration: '20 min' },
    { date: '2025-10-15', activity: 'Practice - Heart', accuracy: 91, duration: '12 min' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-[#86b19c]" style={{ fontFamily: 'Mansalva, cursive' }}>
        Profile
      </h2>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <User className="w-5 h-5" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            />
          </div>
          <div>
            <Label htmlFor="email" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            />
          </div>
          <div>
            <Label htmlFor="phone" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            />
          </div>
          <Button
            onClick={handleSaveChanges}
            className="w-full bg-[#86b19c] hover:bg-[#6d9a84] gap-2"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <Calendar className="w-5 h-5" />
            Activity Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle style={{ fontFamily: 'Lexend, sans-serif' }}>Activity History</CardTitle>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="gap-2"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((item, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontFamily: 'Lexend, sans-serif' }}>{item.activity}</p>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      {item.date} • {item.duration}
                    </p>
                  </div>
                  {item.accuracy !== null && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Accuracy
                      </p>
                      <p
                        className="text-[#86b19c]"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        {item.accuracy}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
