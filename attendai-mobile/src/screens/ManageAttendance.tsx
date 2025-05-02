import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';
import { useAuth } from '../contexts/AuthContext';

interface Student {
  id: number;
  user: {
    id: number;
    username: string;
    email: string | null;
    role: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  };
  school_class: { id: number; name: string; grade_level: number } | null;
  roll_number: string;
  address: string;
}

interface Attendance {
  id?: number;
  student: number;
  status: string;
}

interface SchoolClass {
  id: number;
  name: string;
  grade_level: number;
}

const ManageAttendance: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [groupByStatus, setGroupByStatus] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('username');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axios.get(`${BACKEND_URL}/api/school_data/classes/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data);
        const storedClass = await AsyncStorage.getItem('selectedClass');
        if (storedClass && response.data.some((cls: SchoolClass) => cls.id.toString() === storedClass)) {
          setSelectedClass(storedClass);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students and attendance records
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedClass || !user) return;
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      try {
        const token = await AsyncStorage.getItem('access_token');
        const [studentsResponse, attendanceResponse] = await Promise.all([
          axios.get(
            `${BACKEND_URL}/api/school_data/studentprofiles/?school_class=${selectedClass}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `${BACKEND_URL}/api/attendance/records/?school_class=${selectedClass}&date=${formattedDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setStudents(studentsResponse.data);
        setAttendanceRecords(attendanceResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedClass, selectedDate, user]);

  // Persist selections
  useEffect(() => {
    AsyncStorage.setItem('selectedClass', selectedClass);
    AsyncStorage.setItem('selectedDate', selectedDate.toISOString());
  }, [selectedClass, selectedDate]);

  // Attendance map
  const attendanceMap = useMemo(() => {
    const map = new Map<number, Attendance>();
    attendanceRecords.forEach((record) => map.set(record.student, record));
    return map;
  }, [attendanceRecords]);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, leave: 0 };
    attendanceRecords.forEach((record) => {
      if (record.status === 'present') stats.present++;
      else if (record.status === 'absent') stats.absent++;
      else if (record.status === 'late') stats.late++;
      else if (record.status === 'leave') stats.leave++;
    });
    return stats;
  }, [attendanceRecords]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lowerSearch = searchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.user.username.toLowerCase().includes(lowerSearch) ||
        (student.user.email && student.user.email.toLowerCase().includes(lowerSearch)) ||
        student.user.first_name.toLowerCase().includes(lowerSearch) ||
        student.user.last_name.toLowerCase().includes(lowerSearch)
    );
  }, [students, searchTerm]);

  // Sort students
  const sortedStudents = useMemo(() => {
    const studentsCopy = [...filteredStudents];
    studentsCopy.sort((a, b) => {
      let aField: string = '';
      let bField: string = '';
      if (sortBy === 'username') {
        aField = a.user.username;
        bField = b.user.username;
      } else if (sortBy === 'first_name') {
        aField = a.user.first_name;
        bField = b.user.first_name;
      } else if (sortBy === 'attendance') {
        aField = (attendanceMap.get(a.id)?.status || 'none').toLowerCase();
        bField = (attendanceMap.get(b.id)?.status || 'none').toLowerCase();
      }
      return sortOrder === 'asc'
        ? aField.localeCompare(bField)
        : bField.localeCompare(aField);
    });
    return studentsCopy;
  }, [filteredStudents, sortBy, sortOrder, attendanceMap]);

  // Group students
  const groupedStudents = useMemo(() => {
    const order = ['present', 'absent', 'late', 'leave', 'none'];
    const groups: Record<string, Student[]> = {};
    order.forEach((group) => (groups[group] = []));
    sortedStudents.forEach((student) => {
      const status = (attendanceMap.get(student.id)?.status || 'none').toLowerCase();
      groups[status].push(student);
    });
    return groups;
  }, [sortedStudents, attendanceMap]);

  // Handle attendance status change
  const handleStatusChange = async (studentId: number, status: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const existingRecord = attendanceRecords.find((record) => record.student === studentId);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const data = {
        student: studentId,
        school_class: selectedClass,
        date: formattedDate,
        status,
      };

      if (existingRecord) {
        await axios.put(`${BACKEND_URL}/api/attendance/records/${existingRecord.id}/`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendanceRecords((prev) =>
          prev.map((record) =>
            record.id === existingRecord.id ? { ...record, status } : record
          )
        );
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/attendance/records/`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendanceRecords((prev) => [...prev, response.data]);
      }
    } catch (err) {
      console.error('Error updating or creating attendance:', err);
    }
  };

  // Render student item
  const renderStudentItem = ({ item }: { item: Student }) => {
    const currentStatus = attendanceMap.get(item.id)?.status || '';
    return (
      <View style={styles.studentRow}>
        <Image
          source={{ uri: item.user.profile_picture || 'https://via.placeholder.com/40' }}
          style={styles.profilePic}
        />
        <View style={styles.studentInfo}>
          <Text style={styles.studentText}>{item.user.username}</Text>
          <Text style={styles.studentSubText}>{item.user.email || '-'}</Text>
          <Text style={styles.studentSubText}>
            {item.user.first_name} {item.user.last_name}
          </Text>
        </View>
        <Picker
          selectedValue={currentStatus}
          onValueChange={(value) => handleStatusChange(item.id, value)}
          style={[styles.statusPicker, getStatusStyles(currentStatus)]}
        >
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Present" value="present" />
          <Picker.Item label="Absent" value="absent" />
          <Picker.Item label="Late" value="late" />
          <Picker.Item label="Leave" value="leave" />
        </Picker>
      </View>
    );
  };

  // Status styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'present':
        return { backgroundColor: '#A6E3A1' };
      case 'absent':
        return { backgroundColor: '#F38BA8' };
      case 'late':
        return { backgroundColor: '#FAB387' };
      case 'leave':
        return { backgroundColor: '#89B4FA' };
      default:
        return { backgroundColor: '#292E44' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Attendance</Text>

      {/* Stats Summary */}
      {selectedClass && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Present: {attendanceStats.present}</Text>
          <Text style={styles.statsText}>Absent: {attendanceStats.absent}</Text>
          <Text style={styles.statsText}>Late: {attendanceStats.late}</Text>
          <Text style={styles.statsText}>Leave: {attendanceStats.leave}</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <Picker
          selectedValue={selectedClass}
          onValueChange={(value) => setSelectedClass(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Class" value="" />
          {classes.map((cls) => (
            <Picker.Item
              key={cls.id}
              label={`${cls.name} (Grade ${cls.grade_level})`}
              value={cls.id.toString()}
            />
          ))}
        </Picker>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {selectedDate.toISOString().split('T')[0]}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
        <View style={styles.sortControls}>
          <Picker
            selectedValue={sortBy}
            onValueChange={(value) => setSortBy(value)}
            style={styles.sortPicker}
          >
            <Picker.Item label="Username" value="username" />
            <Picker.Item label="First Name" value="first_name" />
            <Picker.Item label="Attendance" value="attendance" />
          </Picker>
          <Picker
            selectedValue={sortOrder}
            onValueChange={(value) => setSortOrder(value)}
            style={styles.sortPicker}
          >
            <Picker.Item label="Asc" value="asc" />
            <Picker.Item label="Desc" value="desc" />
          </Picker>
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, groupByStatus && styles.toggleActive]}
            onPress={() => setGroupByStatus(true)}
          >
            <Text style={styles.toggleText}>Group</Text>
          </TouchableOpacity>
          <TouchableOpacity Supercell
            style={[styles.toggleButton, !groupByStatus && styles.toggleActive]}
            onPress={() => setGroupByStatus(false)}
          >
            <Text style={styles.toggleText}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search students..."
        placeholderTextColor="#888"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Students List */}
      {loading ? (
        <ActivityIndicator size="large" color="#89B5FA" />
      ) : groupByStatus ? (
        Object.entries(groupedStudents).map(([group, groupStudents]) => (
          groupStudents.length > 0 && (
            <View key={group} style={styles.groupSection}>
              <Text style={styles.groupTitle}>
                {group === 'none' ? 'No Status' : group.charAt(0).toUpperCase() + group.slice(1)} (
                {groupStudents.length})
              </Text>
              <FlatList
                data={groupStudents}
                renderItem={renderStudentItem}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          )
        ))
      ) : (
        <FlatList
          data={sortedStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>No students found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#89B5FA',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#292E44',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsText: {
    color: '#CDD6F4',
    fontSize: 14,
  },
  controls: {
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#292E44',
    color: '#CDD6F4',
    borderRadius: 6,
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#292E44',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  dateText: {
    color: '#CDD6F4',
    fontSize: 16,
  },
  sortControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sortPicker: {
    flex: 1,
    backgroundColor: '#292E44',
    color: '#CDD6F4',
    borderRadius: 6,
    marginHorizontal: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#292E44',
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#89B5FA',
  },
  toggleText: {
    color: '#CDD6F4',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#292E44',
    color: '#CDD6F4',
    borderColor: '#555',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  groupSection: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    color: '#89B5FA',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292E44',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentText: {
    color: '#CDD6F4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentSubText: {
    color: '#888',
    fontSize: 14,
  },
  statusPicker: {
    width: 120,
    color: '#1E1E2E',
    borderRadius: 6,
  },
  emptyText: {
    color: '#CDD6F4',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ManageAttendance;